import { DynamoDBClient, DeleteItemCommandInput, PutItemCommand, ScanCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';


import { v4 } from 'uuid';

const generateItem = () => {
    let rand = Math.floor(Math.random()*100000) + 1
    let randSuffix = Date.now()
    let uuidGen = v4();
    const data = {
        "productId": uuidGen,
        "createAt": Date.now(),
        "shortDescription": `shortDescription_${randSuffix}`,
        "tag": `tag_${randSuffix}`,
        "cost": `${rand}`
    }
    return data;
}

const snsClient = new SNSClient()
const treshold = 10;

const dynamoDbClient = new DynamoDBClient({});
export const handler = async (event: any) => {
    const data = generateItem()
    const tableName = process.env.TABLE_NAME;
    const topicArn = process.env.TOPIC_ARN;
    console.log(data);
    
    const items = await dynamoDbClient.send(new ScanCommand({TableName: tableName}))
    console.log(items);
    if (items.Count! >= 10) {
        await snsClient.send(new PublishCommand({
            TopicArn: topicArn,
            Message: `You reached treshhold of ${treshold} items!`
        }))
        console.log("Notification sent");

        console.log(items.Items);
        let tresholdItems = items.Items?.slice(0,treshold);
        console.log(tresholdItems);
        
        tresholdItems?.forEach(async (x) =>  {
    
            await dynamoDbClient.send(
                new DeleteItemCommand({
                    Key: x,
                    TableName: tableName
                })
            );
            console.log(x);
            console.log(`${treshold} items deleted`);
            
        })
    }
   
    await dynamoDbClient.send(new PutItemCommand({
        TableName: tableName,
        Item: {
            productId: {
                S: data.productId
            },
            shortDescription: {
                S: data.shortDescription
            },
            createAt: {
                S: data.createAt.toString()
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