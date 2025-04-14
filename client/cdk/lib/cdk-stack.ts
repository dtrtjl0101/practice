import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==============================================================
    const bucketName = new cdk.CfnParameter(this, "bucketName", {
      type: "String",
      description: "S3 bucket name for client static files",
    });
    const domainName = new cdk.CfnParameter(this, "domainName", {
      type: "String",
      description: "Domain name for client",
    });
    const subDomainName = new cdk.CfnParameter(this, "subDomainName", {
      type: "String",
      description: "Subdomain name for client",
    });

    // ==============================================================
    const bucket = new cdk.aws_s3.Bucket(this, "ClientBucket", {
      bucketName: bucketName.valueAsString,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
    });

    // ==============================================================
    new cdk.aws_s3_deployment.BucketDeployment(this, "DeployClient", {
      sources: [cdk.aws_s3_deployment.Source.asset("../dist")],
      destinationBucket: bucket,
    });

    // ==============================================================
    const clientDomainName =
      subDomainName.valueAsString === "main"
        ? domainName.valueAsString
        : `${subDomainName.valueAsString}.${domainName.valueAsString}`;
    const zone = cdk.aws_route53.HostedZone.fromLookup(this, "Zone", {
      domainName: domainName.valueAsString,
    });

    const certificate = new cdk.aws_certificatemanager.Certificate(
      this,
      "Certificate",
      {
        domainName: clientDomainName,
        validation:
          cdk.aws_certificatemanager.CertificateValidation.fromDns(zone),
      }
    );

    // ==============================================================
    const originAccessIdentity = new cdk.aws_cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    const s3BucketOrigin =
      cdk.aws_cloudfront_origins.S3BucketOrigin.withOriginAccessIdentity(
        bucket,
        {
          originAccessIdentity,
        }
      );
    const cloudFront = new cdk.aws_cloudfront.Distribution(
      this,
      "ClientCloudFront",
      {
        defaultRootObject: "index.html",
        defaultBehavior: {
          origin: s3BucketOrigin,
        },
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/",
            ttl: cdk.Duration.seconds(0),
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/",
            ttl: cdk.Duration.seconds(0),
          },
        ],
        certificate,
        domainNames: [clientDomainName],
      }
    );

    // ==============================================================
    new cdk.aws_route53.ARecord(this, "ClientRecord", {
      zone,
      recordName: clientDomainName,
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.CloudFrontTarget(cloudFront)
      ),
    });

    const clientDomain = new cdk.CfnOutput(this, "client url", {
      value: `https://${clientDomainName}`,
    });
  }
}
