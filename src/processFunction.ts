import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SNSClient } from '@aws-sdk/client-sns';
import { json } from 'stream/consumers';
import { v4 } from 'uuid';

const generateItem = () => {
    let rand = Math.floor(Math.random()*100000) + 1
    let randSuffix = Date.now()
    let uuidGen = v4();
    const data = {
        "productId": uuidGen,
        "shortDescription": `shortDescription_${randSuffix}`,
        "tag": `tag_${randSuffix}`,
        "cost": `${rand}`
    }
    return data;
}
const dynamoDbClient = new DynamoDBClient({});
export const handler = async (event: any) => {
    const data = generateItem()
    const tableName = process.env.TABLE_NAME;

    await dynamoDbClient.send(new PutItemCommand({
        TableName: tableName,
        Item: {
            productId: {
                S: data.productId
            },
            shortDescription: {
                S: data.shortDescription
            },
            tag: {
                S: data.tag
            }, 
            cost: {
                S: data.cost
            }
        }
    }) );
 
    
}