import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import { EventBus } from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { SepAuthApi } from "./auth-api";
import { SepAppCognitoUserPool } from "./auth-cognito";
import { SepAuthDatabase } from "./auth-database";
import { SepAuthService } from "./auth-service";

interface SepAuthServiceConstructProps {
  // the event bus
  readonly eventBus: EventBus;

  // the layer for the common features
  readonly layer: lambda.LayerVersion;
}

export class SepAuthStack extends Construct {
  // database
  public readonly database: SepAuthDatabase;

  // the userpool
  public readonly appCognito: SepAppCognitoUserPool;

  // the microservice
  public readonly authService: SepAuthService;

  // api
  public readonly authApi: SepAuthApi;

  constructor(
    scope: Construct,
    id: string,
    props: SepAuthServiceConstructProps
  ) {
    super(scope, id);

    // ----------------------------------------
    //   Database
    // ----------------------------------------

    this.database = new SepAuthDatabase(this, "sep-auth-database");

    // ----------------------------------------
    //   Cognito
    // ----------------------------------------

    this.appCognito = new SepAppCognitoUserPool(this, "sep-app-cognito");

    // ----------------------------------------
    //   Service
    // ----------------------------------------

    // auth service
    this.authService = new SepAuthService(this, "sep-auth-service", {
      layer: props.layer,
      eventBus: props.eventBus,
    });

    // connect the lambda to the database
    this.lambdaToDynamoDB(
      this.authService.sessionFn,
      this.database.sessionTable
    );
    this.lambdaToDynamoDB(
      this.authService.triggerPostAuthFn,
      this.database.sessionTable
    );
    this.lambdaToDynamoDB(
      this.authService.triggerPostConfirmationFn,
      this.database.userTable
    );

    // connect the lambda to cognito
    this.lambdaToCognito(
      this.authService.confirmSignupFn,
      this.appCognito.userPool.userPoolId,
      this.appCognito.userPoolClient.userPoolClientId
    );
    this.lambdaToCognito(
      this.authService.sendCodeFn,
      this.appCognito.userPool.userPoolId,
      this.appCognito.userPoolClient.userPoolClientId
    );

    this.lambdaToCognito(
      this.authService.signinFn,
      this.appCognito.userPool.userPoolId,
      this.appCognito.userPoolClient.userPoolClientId
    );

    this.lambdaToCognito(
      this.authService.signoutFn,
      this.appCognito.userPool.userPoolId,
      this.appCognito.userPoolClient.userPoolClientId
    );

    this.lambdaToCognito(
      this.authService.signupFn,
      this.appCognito.userPool.userPoolId,
      this.appCognito.userPoolClient.userPoolClientId
    );

    // add triggers
    this.appCognito.userPool.addTrigger(
      cognito.UserPoolOperation.PRE_SIGN_UP,
      this.authService.triggerPreSignupFn
    );
    this.appCognito.userPool.addTrigger(
      cognito.UserPoolOperation.PRE_AUTHENTICATION,
      this.authService.triggerPreAuthFn
    );
    this.appCognito.userPool.addTrigger(
      cognito.UserPoolOperation.POST_AUTHENTICATION,
      this.authService.triggerPostAuthFn
    );
    this.appCognito.userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      this.authService.triggerPostConfirmationFn
    );
    this.appCognito.userPool.addTrigger(
      cognito.UserPoolOperation.PRE_TOKEN_GENERATION,
      this.authService.triggerPreTokenGenerationFn
    );

    // ----------------------------------------
    //   API
    // ----------------------------------------
    this.authApi = new SepAuthApi(this, "sep-auth-api", {
      confirmSignupFn: this.authService.confirmSignupFn,
      sendCodeFn: this.authService.sendCodeFn,
      sessionFn: this.authService.sessionFn,
      signinFn: this.authService.signinFn,
      signoutFn: this.authService.signoutFn,
      signupFn: this.authService.signupFn,
    });
  }

  /**
   * Helper function to connect the database tables to the lambda
   * @param fn
   * @param table
   */
  private lambdaToDynamoDB(fn: lambda.Function, table: ddb.Table) {
    // Give our Lambda permissions to read and write data from the passed in DynamoDB table
    table.grantReadWriteData(fn);
    // add environmental variables
    fn.addEnvironment("TABLE_NAME", table.tableName);
    fn.addEnvironment("PRIMARY_KEY", "pk");
    fn.addEnvironment("SORT_KEY", "sk");
  }

  /**
   * Helper function to connect cognito to the lambda
   * @param fn
   * @param userPoolId
   * @param userPoolClientId
   */
  private lambdaToCognito(
    fn: lambda.Function,
    userPoolId: string,
    userPoolClientId: string
  ) {
    // AWS Lambda functions need permissions to interact with all the userpool
    fn.addPermission("sep-CognitoPermission", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:userpool/*`,
    });
    // add environmental variables
    fn.addEnvironment("USER_POOL_ID", userPoolId);
    fn.addEnvironment("USER_POOL_CLIENT_ID", userPoolClientId);
  }
}
