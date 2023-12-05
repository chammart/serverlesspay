/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 */

// Imports
import { RemovalPolicy } from "aws-cdk-lib";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

// Construct
// -
// This construct provisions tables: users, sessions.
//
export class SepAuthDatabase extends Construct {
  
  public readonly sessionTable: ddb.Table;
  public readonly userTable: ddb.Table;


  constructor(scope: Construct, id: string) {
    super(scope, id);

    // user table
    // user: PK: tenantId SK: sub -- username - email - role - firstname - lastname - tier - userPoolId - appClientId
    this.userTable = this.createTable(this, "sep-user-table");
    // this global secondary index will help query users and tenants based the userPoolId and appClientId
    const userpoolGsi = this.userTable.addGlobalSecondaryIndex({
      indexName: "userpool-appclient-index",
      partitionKey: {
        name: "userPoolId",
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: "appClientId",
        type: ddb.AttributeType.STRING,
      },
      projectionType: ddb.ProjectionType.ALL,
    });

    // session table
    // session: PK: tenantId SK: last-access -- login-time - email - userPoolId - sub
    this.sessionTable = this.createTable(this, "sep-session-table");
    // this global secondary index will help query users based on their last access and login time
    const subLastAccessGsi = this.sessionTable.addGlobalSecondaryIndex({
      indexName: "sub-lastAccess-index",
      partitionKey: {
        name: "sub",
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: "lastAccess",
        type: ddb.AttributeType.STRING,
      },
      projectionType: ddb.ProjectionType.ALL,
    });
  }

  /**
   * Helper function to shorten Table creation boilerplate as we have 6 in this stack
   * @param scope
   * @param tableName
   */
  private createTable(scope: Construct, tableName: string): ddb.Table {
    const dbTable = new ddb.Table(scope, tableName, {
      tableName: tableName,
      partitionKey: {
        name: "pk",
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: ddb.AttributeType.STRING,
      },
      stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES, //enable DB stream
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    });
    return dbTable;
  }
}
