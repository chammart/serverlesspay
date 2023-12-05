/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 */
import { APIGatewayProxyResult } from "aws-lambda";

export enum StatusCodes {
  CREATED = 201,
  SUCCESS = 200,
  UN_AUTHORIZED = 401,
  NOT_FOUND = 404,
}

/**
 * Info object
 */
export interface Info {
  statusCode: number;
  service: string;
  operation: string;
  message: string;
  details: any;
}

/**
 * Error object
 */
export interface Error extends Info {
  name: string;
  type: string;
  caused: string; 
}

/**
 * Extend APIGatewayProxyResult but omit the body property so that we can define
 * our own with multi valued type.  Omit to the rescue!
 */
export interface APIGatewayApiProxyResult
  extends Omit<APIGatewayProxyResult, "body"> {
  body: string | Info | Error;
}
