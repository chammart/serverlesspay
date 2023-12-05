import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SepAuthStack } from "./auth/auth-service-stack";
import { SepSharedResources } from "./shared";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ServerlesspayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================================================
    // Provision shared resources
    // ========================================================================
    const sepSharedResources = new SepSharedResources(
      this,
      "shc-shared-resources"
    );

    // ========================================================================
    // Provision auth stack
    // ========================================================================
    const sepAuthStack = new SepAuthStack(this, "sep-auth-stack", {
      eventBus: sepSharedResources.eventBus,
      layer: sepSharedResources.layer,
    });
  }
}
