#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CertificationStack } from "../lib/CertificationStack";
import { ClientDeploymentStack } from "../lib/ClientDeploymentStack";

const app = new cdk.App();
const certificationStack = new CertificationStack(app, "CertificationStack", {
  stackName: `${process.env.CDK_STACK_NAME}CertificationStack`,
  env: {
    region: "us-east-1",
  },
});
new ClientDeploymentStack(app, "ClientDeploymentStack", {
  certificate: certificationStack.certificate,
  stackName: `${process.env.CDK_STACK_NAME}ClientDeploymentStack`,
  crossRegionReferences: true,
  env: {
    region: process.env.AWS_DEFAULT_REGION,
  },
});
app.synth();
