import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { SNSClient } from '@aws-sdk/client-sns';
import { json } from 'stream/consumers';

const dynamoDbClient = new DynamoDBClient({});
export const handler = async (event: any) => {

    console.log(event);
    
}