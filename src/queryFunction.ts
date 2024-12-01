import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoDbClient = new DynamoDBClient({});
export const handler = async (event: any) => {
    const tableName = process.env.TABLE_NAME;
    const topicArn = process.env.TOPIC_ARN;

   
    console.log(event);
    
 
    return {
        statusCode: 200,
        body: "response"
    }
}