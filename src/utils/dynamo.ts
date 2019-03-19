import AWS from 'aws-sdk';
import {
    IDocumentAccess as IDocAccess,
    IUserProfile
} from '../types';

const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'ap-southeast-2'
});

const DOCUMENT_ACCESS_TABLE = 'DocumentAccess';
const USER_PROFILE_TABLE = 'UserProfile';

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

export const getDocAccessById = async (
    id: string
): Promise<IDocAccess | null> => {
    const dynamoParams = {
        TableName: DOCUMENT_ACCESS_TABLE,
        ProjectionExpression:
            'id, userId, permalink, generatePDF, generateWord, secret, protectionMode',
        KeyConditionExpression: 'id = :did',
        ExpressionAttributeValues: {
            ':did': id
        }
    };

    const result = await dynamoDb.query(dynamoParams).promise();
    const item = result.Items.length > 0 ? result.Items[0] : null;

    return item as IDocAccess;
};

export const getDocAccess = async (
    userId: string,
    permalink: string
): Promise<IDocAccess> => {
    const dynamoParams = {
        TableName: DOCUMENT_ACCESS_TABLE,
        ProjectionExpression:
            'id, userId, permalink, generatePDF, generateWord, secret, protectionMode',
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

export const getUserProfileByName = async (
    name: string
): Promise<IUserProfile> => {
    const dynamoParams = {
        TableName: USER_PROFILE_TABLE,
        ProjectionExpression: 'id, username, userType',
        KeyConditionExpression: 'username = :uname',
        ExpressionAttributeValues: {
            ':uname': name
        }
    };
    const result = await dynamoDb.query(dynamoParams).promise();
    const item = result.Items.length > 0 ? result.Items[0] : null;

    return item as IUserProfile;
};

export const getUserProfileById = async (
    id: string
): Promise<IUserProfile> => {
    const dynamoParams = {
        TableName: USER_PROFILE_TABLE,
        ProjectionExpression: 'id, username, userType',
        KeyConditionExpression: 'id = :uid',
        ExpressionAttributeValues: {
            ':uid': id
        }
    };
    const result = await dynamoDb.query(dynamoParams).promise();
    const item = result.Items.length > 0 ? result.Items[0] : null;
    return item as IUserProfile;
};

export const registerUserProfile = async (
    userProfile: IUserProfile
) => {
    try {
        const existingUserProfile = await getUserProfileById(
            userProfile.id
        );

        if (!existingUserProfile) {
            await putObjectToDynamo(userProfile, USER_PROFILE_TABLE);
        }
    } catch (err) {
        console.error(err);
    }
};
