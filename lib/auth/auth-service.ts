import * as cdk from "aws-cdk-lib";
import { EventBus } from "aws-cdk-lib/aws-events";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SepAuthServiceProps {
  // the userpool
  // readonly userPoolId: string;
  // readonly userPoolClientId: string;

  // the tables
  //readonly userTable: ddb.Table;
  // readonly sessionTable: ddb.Table;

  // the event bus
  readonly eventBus: EventBus;

  // the layer for the common features
  readonly layer: lambda.LayerVersion;
}

export class SepAuthService extends Construct {
  public readonly confirmSignupFn: lambda.Function;
  public readonly sendCodeFn: lambda.Function;
  public readonly sessionFn: lambda.Function;
  public readonly signinFn: lambda.Function;
  public readonly signoutFn: lambda.Function;
  public readonly signupFn: lambda.Function;
  public readonly triggerPostAuthFn: lambda.Function;
  public readonly triggerPostConfirmationFn: lambda.Function;
  public readonly triggerPreAuthFn: lambda.Function;
  public readonly triggerPreTokenGenerationFn: lambda.Function;
  public readonly triggerPreSignupFn: lambda.Function;

  constructor(scope: Construct, id: string, props: SepAuthServiceProps) {
    super(scope, id);

    // ----------------------------------------
    //   Lambda functions
    // ----------------------------------------
    // confirmSignupFn
    this.confirmSignupFn = this.createService(
      this,
      "confirm-signup",
      props.layer,
      props.eventBus
    );
    // sendCodeFn
    this.sendCodeFn = this.createService(
      this,
      "send-code",
      props.layer,
      props.eventBus
    );
    // sessionFn
    this.sessionFn = this.createService(
      this,
      "session",
      props.layer,
      props.eventBus
    );
    // signinFn
    this.signinFn = this.createService(
      this,
      "signin",
      props.layer,
      props.eventBus
    );
    // signupFn
    this.signupFn = this.createService(
      this,
      "signup",
      props.layer,
      props.eventBus
    );
    // signoutFn
    this.signoutFn = this.createService(
      this,
      "signout",
      props.layer,
      props.eventBus
    );
    // triggerPostAuthFn
    this.triggerPostAuthFn = this.createService(
      this,
      "trigger-post-auth",
      props.layer,
      props.eventBus
    );

    // triggerPostConfirmationFn
    this.triggerPostConfirmationFn = this.createService(
      this,
      "trigger-post-confirmation",
      props.layer,
      props.eventBus
    );
    // triggerPreAuthFn
    this.triggerPreAuthFn = this.createService(
      this,
      "trigger-pre-auth",
      props.layer,
      props.eventBus
    );
    // triggerPreTokenGenerationFn
    this.triggerPreTokenGenerationFn = this.createService(
      this,
      "trigger-pre-token-gen",
      props.layer,
      props.eventBus
    );
    // triggerPreSignupFn
    this.triggerPreSignupFn = this.createService(
      this,
      "trigger-pre-signup",
      props.layer,
      props.eventBus
    );
  }

  /**
   * Helper function to shorten Lambda boilerplate as we have 6 in this stack
   * @param scope
   * @param serviceName
   * @param table
   * @param props
   */
  private createService(
    scope: Construct,
    serviceName: string,
    layer: lambda.LayerVersion,
    eventBus: EventBus
  ): lambda.Function {
    // Create a Node Lambda with the table name passed in as an environment variable
    let fn = new lambda.Function(scope, serviceName, {
      functionName: serviceName,
      runtime: lambda.Runtime.NODEJS_18_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(10),
      code: lambda.Code.fromAsset(`lambdas/auth`),
      tracing: lambda.Tracing.ACTIVE,
      handler: `${serviceName}.handler`,
      layers: [layer],
      environment: {
        EVENT_BUS_NAME: eventBus.eventBusName,
        // TABLE_NAME: table.tableName,
        // PRIMARY_KEY: "pk",
        // SORT_KEY: "sk",
        // USER_POOL_ID: props.userPoolId,
        // USER_POOL_CLIENT_ID: props.userPoolClientId,
      },
    });

    // Give our Lambda permissions to read and write data from the passed in DynamoDB table
    // table.grantReadWriteData(fn);

    /*    // AWS Lambda functions need permissions to interact with all the userpool
    fn.addPermission("sep-CognitoPermission", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:userpool/*`,
    }); */
    // Give our Lambda permissions to send events to to the eventbus
    eventBus.grantPutEventsTo(fn);

    return fn;
  }
}
