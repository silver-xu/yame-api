import AWS from 'aws-sdk';
import { IDocumentAccess as IDocAccess } from '../types';
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const DOCUMENT_ACCESS_TABLE = 'DocumentAccess';

export const putObjectToDynamo = async (
    object: any,
    tableName: string
) => {
    const dynamoParams = {
        TableName: tableName,
        Item: object
    };

    return dynamoDb.put(dynamoParams).promise();
};

export const updateDocAccess = async (documentAccess: IDocAccess) => {
    await putObjectToDynamo(documentAccess, DOCUMENT_ACCESS_TABLE);
};

export const getDocAccess = async (
    userId: string,
    permalink: string
): Promise<IDocAccess> => {
    const dynamoParams = {
        TableName: DOCUMENT_ACCESS_TABLE,
        ProjectionExpression:
            'id, userId, permalink, generatePDF, generateWord, secret, protectionMode, lastPublishedHash',
        KeyConditionExpression:
            'userId = :uid and permalink = :plink',
        ExpressionAttributeValues: {
            ':uid': userId,
            ':plink': permalink
        }
    };

    const result = await dynamoDb.query(dynamoParams).promise();
    const item = result.Items.length > 0 ? result.Items[0] : null;

    return item as IDocAccess;
};
