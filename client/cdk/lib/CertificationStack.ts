import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CertificationStack extends cdk.Stack {
  public readonly certificate: cdk.aws_certificatemanager.ICertificate;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==============================================================
    const domainName = `${process.env.DOMAIN_NAME}`;
    const subDomainName = `${process.env.BRANCH_NAME}`;
    const clientDomainName =
      subDomainName === "main" ? domainName : `${subDomainName}.${domainName}`;
    const zoneId = `${process.env.ZONE_ID}`;

    // ==============================================================
    const zone = cdk.aws_route53.HostedZone.fromHostedZoneAttributes(
      this,
      "Zone",
      {
        hostedZoneId: zoneId,
        zoneName: domainName,
      }
    );

    this.certificate = new cdk.aws_certificatemanager.Certificate(
      this,
      "Certificate",
      {
        domainName: clientDomainName,
        validation:
          cdk.aws_certificatemanager.CertificateValidation.fromDns(zone),
      }
    );
  }
}
