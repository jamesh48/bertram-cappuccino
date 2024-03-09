#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BCPStack } from '../lib/bcp-stack';

const app = new cdk.App();

const { AWS_ALB_LISTENER_ARN, AWS_CLUSTER_ARN, AWS_DEFAULT_SG, AWS_VPC_ID } =
  process.env;

if (!AWS_ALB_LISTENER_ARN) {
  throw new Error('AWS_ALB_LISTENER_ARN env is not defined!');
}

if (!AWS_CLUSTER_ARN) {
  throw new Error('AWS_CLUSTER_ARN env is not defined!');
}

if (!AWS_DEFAULT_SG) {
  throw new Error('AWS_DEFAULT_SG env is not defined!');
}

if (!AWS_VPC_ID) {
  throw new Error('AWS_VPC_ID env is not defined!');
}

new BCPStack(app, 'bcp-stack', {
  aws_env: {
    AWS_ALB_LISTENER_ARN,
    AWS_CLUSTER_ARN,
    AWS_DEFAULT_SG,
    AWS_VPC_ID,
  },
  svc_env: {},
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
