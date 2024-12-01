import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as AwsExamRetake from '../lib/aws-exam-retake-stack';
import 'jest-cdk-snapshot';


test('Test CDK Stack', () => {
  const app = new cdk.App();
  const stack = new AwsExamRetake.AwsExamRetakeStack(app, 'MyTestStack');
  expect(stack).toMatchCdkSnapshot();

});
