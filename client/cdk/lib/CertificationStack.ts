import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "@aws-cdk/aws-cloudfront-origins-alpha";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";

export class CertificationStack extends cdk.Stack {
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = `${process.env.DOMAIN_NAME}`;
    const subDomainName = `${process.env.BRANCH_NAME}`;
    const clientDomainName =
      subDomainName === "main" ? domainName : `${subDomainName}.${domainName}`;
    const zoneId = `${process.env.ZONE_ID}`;

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, "Zone", {
      hostedZoneId: zoneId,
      zoneName: domainName,
    });

    const bucket = new s3.Bucket(this, "ClientBucket");

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      "ExistingCertificate",
      "arn:aws:acm:us-east-1:880996438467:certificate/c1bdc28e-96c0-4f11-a70f-6fddfbf44b00"
    );

    new cloudfront.Distribution(this, "ClientCloudFront", {
      defaultBehavior: { origin: new S3Origin(bucket) }, // ✅ 여기 수정
      domainNames: [clientDomainName],
      certificate: certificate, // ✅ us-east-1 인증서 연결
    });
  }
}
