import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
 

const dynamoDbClient = new DynamoDBClient({});
export const handler = async (event: any) => {
    const tableName = process.env.TABLE_NAME;
    console.log(event);
    
    const body = JSON.parse(event.body);
    if (body.productId){
        
        let productId = body.productId;
        console.log(productId);
        const response = await dynamoDbClient.send(new GetItemCommand({
            Key: {
                "productId": {
                    "S": productId
                }
            },
            TableName: tableName
        }))
        if (!('Item' in response)) {
            return {
                statusCode: 404,
                body: "No such product"
            }
        } 
        let responseObj = {
            
            "productId": response.Item!.productId.S,
            "shortDescription": response.Item!.shortDescription.S,
            "tag":  response.Item!.tag.S,
            "cost": response.Item!.cost.N
            
        }
        console.log(responseObj);
        return {
            statusCode: 200,
            "item": JSON.stringify(responseObj)
        }
    }

    return {
        statusCode: 400,
        body: "Bad request"
    }
}