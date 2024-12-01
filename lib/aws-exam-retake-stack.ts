import * as cdk from 'aws-cdk-lib';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Subscription, SubscriptionProtocol, Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsExamRetakeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const thresholdTopic  = new Topic(this, 'ThresholdTopic', {
      topicName: "thresholdTopic"
    })

    new Subscription(this, 'ErrorSubscription', {
      topic: thresholdTopic,
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: 'email'
    })

    const inventoryTable = new Table(this, 'InventoryTable', {
      partitionKey: {
        name: 'productId',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_AND_OLD_IMAGES
    });
  }
}
