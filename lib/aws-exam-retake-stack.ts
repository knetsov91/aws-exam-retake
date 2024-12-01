import * as cdk from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Subscription, SubscriptionProtocol, Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsExamRetakeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const thresholdTopic  = new Topic(this, 'ThresholdTopic', {
      topicName: "thresholdTopic"
    })

    // new Subscription(this, 'ErrorSubscription', {
    //   topic: thresholdTopic,
    //   protocol: SubscriptionProtocol.EMAIL,
    //   endpoint: 'email'
    // })

    const inventoryTable = new Table(this, 'InventoryTable', {
      partitionKey: {
        name: 'productId',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_AND_OLD_IMAGES
    });

    const queryFunction = new NodejsFunction(this, 'QueryFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: `${__dirname}/../src/queryFunction.ts`,
      environment: {
        TABLE_NAME: inventoryTable.tableName
      }
    })

    const api = new RestApi(this, 'InventoryManagementApi');
    const resource = api.root.addResource('processJSON');
    resource.addMethod('POST', new LambdaIntegration(queryFunction));

  }
}
