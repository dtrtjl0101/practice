import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53_targets from "aws-cdk-lib/aws-route53-targets";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3_deployment from "aws-cdk-lib/aws-s3-deployment";
import * as iam from "aws-cdk-lib/aws-iam";

export class ClientDeploymentStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & {
      certificate: acm.ICertificate;
    }
  ) {
    super(scope, id, props);

    const { certificate } = props;

    const bucketName = `${process.env.BRANCH_NAME}-chaekit-client`;
    const domainName = `${process.env.DOMAIN_NAME}`;
    const subDomainName = `${process.env.BRANCH_NAME}`;
    const clientDomainName =
      subDomainName === "main" ? domainName : `${subDomainName}.${domainName}`;
    const zoneId = `${process.env.ZONE_ID}`;

    // S3 버킷 생성
    const bucket = new s3.Bucket(this, "ClientBucket", {
      bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
    });

    // Route53 Hosted Zone
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, "Zone", {
      hostedZoneId: zoneId,
      zoneName: domainName,
    });

    // CloudFront OAI (Origin Access Identity)
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );

    // S3Origin 생성 (CDK v2)
    const s3BucketOrigin = new S3Origin(bucket, { originAccessIdentity });

    // CloudFront 배포
    const cloudFront = new cloudfront.Distribution(this, "ClientCloudFront", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: s3BucketOrigin,
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: "/", ttl: cdk.Duration.seconds(0) },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: "/", ttl: cdk.Duration.seconds(0) },
      ],
      certificate, // us-east-1 ACM 인증서
      domainNames: [clientDomainName],
    });

    // S3 배포
    const deployment = new s3_deployment.BucketDeployment(this, "DeployClient", {
      sources: [s3_deployment.Source.asset("../dist")],
      destinationBucket: bucket,
      distribution: cloudFront,
      distributionPaths: ["/*"],
    });

    deployment.handlerRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["cloudfront:GetInvalidation", "cloudfront:CreateInvalidation"],
        resources: ["*"],
      })
    );

    // Route53 A 레코드 생성
    new route53.ARecord(this, "ClientRecord", {
      zone,
      recordName: clientDomainName,
      target: route53.RecordTarget.fromAlias(new route53_targets.CloudFrontTarget(cloudFront)),
    });

    new cdk.CfnOutput(this, "ClientURL", {
      value: `https://${clientDomainName}`,
    });
  }
}
