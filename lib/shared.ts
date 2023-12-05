/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 */

// Imports
import { EventBus } from "aws-cdk-lib/aws-events";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

// Construct
// -
// This construct provisions resources that might be shared by other services.
//
export class SepSharedResources extends Construct {
  // Public variables

  // the layer for the common features
  public readonly layer: lambda.LayerVersion;
  // the event bus
  public readonly eventBus: EventBus;

  // Constructor
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Setup a Lambda layer for sharing utility functions -------------------------------------------------------------
    this.layer = new lambda.LayerVersion(
      this,
      "sep-shared-functions-layer",
      {
        code: lambda.Code.fromAsset("lambdas/shared"),
        compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
        license: "Apache-2.0",
        description: "Layer for common features",
      }
    );

    //eventbus
    this.eventBus = new EventBus(this, "sep-eventBus", {
      eventBusName: "sep-eventBus",
    });
  }
}
