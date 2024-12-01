import * as cdk from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { CfnSchedule, CfnScheduleGroup } from 'aws-cdk-lib/aws-scheduler';
import { Subscription, SubscriptionProtocol, Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsExamRetakeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const thresholdTopic  = new Topic(this, 'ThresholdTopic', {
      topicName: "thresholdTopic"
    })

    new Subscription(this, 'ThresholdTopicSubscription', {
      topic: thresholdTopic,
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: 'knetsov91@gmail.com'
    })

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
    inventoryTable.grantReadData(queryFunction);

    const api = new RestApi(this, 'InventoryManagementApi');
    const resource = api.root.addResource('getProduct');
    resource.addMethod('POST', new LambdaIntegration(queryFunction));


    const processFunction = new NodejsFunction(this, 'ProcessFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: `${__dirname}/../src/processFunction.ts`,
      environment: {
        TABLE_NAME: inventoryTable.tableName
      }
    })
    inventoryTable.grantReadWriteData(processFunction);
     this.createScheuler(processFunction)
  }

  createScheuler(fn: NodejsFunction) {
    const schedulerRole = new Role(this, 'scheduler-role', {
      assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
    });

    new Policy(this, 'schedule-policy', {
      policyName: 'ScheduleToInvokeLambdas',
      roles: [schedulerRole],
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['lambda:InvokeFunction'],
          resources: [fn.functionArn],
        }),
      ],
    });
    const group = new CfnScheduleGroup(this, 'schedule-group', {
      name: 'SchedulesForLambda',
    });

    new CfnSchedule(this, 'my-schedule', {
      groupName: group.name,
      flexibleTimeWindow: {
        mode: 'OFF',
      },
      scheduleExpression: 'rate(1 minute)',
      target: {
        arn: fn.functionArn,
        roleArn: schedulerRole.roleArn,
      },
    });
  }
  
}
