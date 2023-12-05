// we import dependencies that will help us to create a sign-up method.
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  SignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Logger } from "/opt/logger";
import { Error, Info } from "/opt/types";
import { generateAPIResponse } from "/opt/utils";

// Set up AWS Cognito client
const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
const log = new Logger();

type eventBody = {
  email: string;
  password: string;
};

exports.handler = async function (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  // build api response with info
  const info: Info = <Info>{
    statusCode: 200,
    service: "Auth",
    operation: "signup",
    message: `Called operation: "${event.httpMethod}${event.path}"`,
    details: {
      event,
      context,
    },
  };
  log.debug(info);
  let result;

  // health check
  if (event.httpMethod == "OPTIONS") {
    result = generateAPIResponse(info);
    return result;
  }

  // validate there is an event body
  if (!event.body) {
    info.statusCode = 400;
    info.message = `Failed to perform operation: "${event.httpMethod}${event.path}"`;
    info.details =
      "Event body is missing - You must provide required parameters - email and password";
    log.debug(info);

    result = generateAPIResponse(info);
    return result;
  }
  // The signup method will take the email, and password as input and .
  const { email, password }: eventBody = JSON.parse(event.body);

  // Define signup parameters
  const params: SignUpCommandInput = {
    ClientId: process.env.USER_POOL_CLIENT_ID!,
    Username: email,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
  };

  try {
    // Call the SignUp API and create the user in the Cognito directory
    const command = new SignUpCommand(params);
    const response = await client.send(command);

    // operation is completed successfully
    info.statusCode = response.$metadata.httpStatusCode || 201;
    info.message = `Successfully completed operation: "${event.httpMethod}${event.path}"`;
    info.details = response;

    log.info(info);

    // TODO publish an event to eventbridge - this will subscribe by order microservice and start ordering process.
    // const publishedEvent = await publishCheckoutBasketEvent(checkoutPayload);

    result = generateAPIResponse(info);
    return result;
  } catch (err: any) {
    // return the error
    const error: Error = <Error>{
      statusCode: err.$metadata.httpStatusCode,
      name: err.name,
      message: `${err.message}`,
      type: err.__type,
      caused: `Failed to perform operation: "${event.httpMethod}${event.path}`,
      details: err,
    };
    log.error(error);
    result = generateAPIResponse(error);
    return result;
  }
};
