/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 */

// Imports
import { CfnOutput, Duration, RemovalPolicy } from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";


export class SepAppCognitoUserPool extends Construct {
  // Public variables
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;

  // Constructor
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create the user pool
    this.userPool = new cognito.UserPool(this, "sep-app-cognito-user-pool", {
      userPoolName: "sep-app-cognito-user-pool",
      selfSignUpEnabled: true, // whether or no users are allowed to sign up
      signInAliases: {
        // whether users should sign in via email, phone number or username
        // username: true,
        email: true,
      },
      removalPolicy: RemovalPolicy.DESTROY, // specify whether the User Pool should be retained in the account after the stack is deleted. The default behavior is for the User Pool to be retained in the account (in an orphaned state).
      autoVerify: { email: true }, // specify attributes that Cognito will automatically request verification for, when a user signs up. Allowed values are email or phone.
      passwordPolicy: {
        // set a password policy to force users to sign up with secure passwords
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true,
        tempPasswordValidity: Duration.days(3),
      },
      signInCaseSensitive: false, // Whether sign-in aliases should be evaluated with case sensitivity. For example, when this option is set to false, users will be able to sign in using either MyUsername or myusername.
      // Configure whether users of this user pool can or are required use MFA to sign in
      mfa: cognito.Mfa.OPTIONAL, // Users are not required to use MFA for sign in, but can configure one if they so choose to
      mfaSecondFactor: {
        otp: true, //
        sms: false,
      },
      // specify required standard attributes that users must provide when signing up
      standardAttributes: {
        givenName: {
          required: false,
          mutable: true,
        },
        familyName: {
          required: false,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
        email: {
          required: true,
          mutable: false,
        },
      },
      // This is where we introduce attributes that connect users to tenants. When we provision tenants, we'll persist these additional attributes as part of each user's profile. This same data will also be embedded in the tokens that are returned by the authentication process.
      customAttributes: {
        tier: new cognito.StringAttribute({ mutable: true }), // the tier this user has subscribed to
        company: new cognito.StringAttribute({ mutable: true }), // the company name
        tenant: new cognito.StringAttribute({ mutable: false }), // the tenant id
        account: new cognito.StringAttribute({ mutable: true }), // the account tied to this tenant - bY default is the company name
        role: new cognito.StringAttribute({ mutable: true }), // the role the user has in this userpool
        country: new cognito.StringAttribute({ mutable: true }), // the role the user has in this userpool
      },

      userVerification: {
        emailSubject: "Shopping cart App - Verify your email",
        emailBody:
          "Thanks for signing up to the Shopping cart App. Your verification code is {####}",
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY, // specify how users should recover their account in case they forget their password
      // customSenderKmsKey: props.cmk, // This key will be used to encrypt temporary passwords and authorization codes that Amazon Cognito generates.
    });

    /*    // 👇 User Pool Client attributes
    const standardCognitoAttributes = {
      givenName: true,
      familyName: true,
      email: true,
      emailVerified: true,
      phoneNumber: true,
      phoneNumberVerified: true,
      address: true,
      birthdate: true,
      gender: true,
      locale: true,
      middleName: true,
      fullname: true,
      nickname: true,
      profilePicture: true,
      preferredUsername: true,
      profilePage: true,
      timezone: true,
      lastUpdateTime: true,
      website: true,
    };    

    // Creates a ClientAttributes with the specified attributes
    const clientReadAttributes = new cognito.ClientAttributes()
      .withStandardAttributes({
        ...standardCognitoAttributes,
        // emailVerified: false,
        // phoneNumberVerified: false,
      })
      .withCustomAttributes(
        ...["tier", "company", "tenant", "account", "role", "country"]
      );

    const clientWriteAttributes = new cognito.ClientAttributes()
      .withStandardAttributes({
        ...standardCognitoAttributes,
        // email: false,
        emailVerified: false,
        phoneNumberVerified: false,
      })
      .withCustomAttributes(
        ...["tier", "company", "tenant", "account", "role", "country"]
      ); */

    // we're going to configure AWS Cognito to add some triggers.
    /*     userPool.addTrigger(
      cognito.UserPoolOperation.PRE_SIGN_UP,
      this.triggerPreSignupFn
    );
    userPool.addTrigger(
      cognito.UserPoolOperation.PRE_AUTHENTICATION,
      this.triggerPreAuthFn
    );
    userPool.addTrigger(
      cognito.UserPoolOperation.POST_AUTHENTICATION,
      this.triggerPostAuthFn
    );
    userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      this.triggerPostConfirmationFn
    );

    userPool.addTrigger(
      cognito.UserPoolOperation.PRE_TOKEN_GENERATION,
      this.triggerPreTokenGenerationFn
    ); */

    // Add the application client to the userpool
    this.userPoolClient = this.userPool.addClient(
      "sep-cognito-user-pool-client",
      {
        userPoolClientName: "sep-cognito-user-pool-client",
        authFlows: {
          adminUserPassword: true, // Enable admin based user password authentication flow
          userPassword: true, // Enable auth using username & password
          userSrp: true, // Enable SRP based authentication
          custom: true, // Enable custom authentication flow
        },
        supportedIdentityProviders: [
          // the identity providers the client supports.
          cognito.UserPoolClientIdentityProvider.COGNITO,
        ],
        // readAttributes: clientReadAttributes,
        // writeAttributes: clientWriteAttributes,
        // accessTokenValidity: Duration.days(1),
        // idTokenValidity: Duration.days(1),
        // refreshTokenValidity: Duration.days(30),
        refreshTokenValidity: Duration.minutes(60),
        accessTokenValidity: Duration.minutes(5),
        idTokenValidity: Duration.minutes(5),

        preventUserExistenceErrors: true,
      }
    );

    // assign the userPoolId && userPoolClientId
    // this.userPoolId = userPool.userPoolId;
    // this.userPoolClientId = appClient.userPoolClientId;

    new CfnOutput(this, "sep-app-cognito-user-pool-ID", {
      value: this.userPool.userPoolId,
      description: "userPoolId required for shopping-cart-app",
    });

    new CfnOutput(this, "sep-app-cognito-user-pool-client-ID", {
      value: this.userPoolClient.userPoolClientId,
      description: "clientId required for shopping-cart-app",
    });
  }
}
