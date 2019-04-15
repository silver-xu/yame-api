import AWS from 'aws-sdk';
import { IDocPermalink, IUserProfile } from '../types';

const STAGE = process.env.STAGE || '';

const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'ap-southeast-2'
});

const DOCUMENT_PERMALINKS_TABLE =
    process.env.DOC_PERMALINKS_TABLE || '';
const USER_PROFILE_TABLE = process.env.USER_PROFILE_TABLE || '';

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

export const updateDocPermalink = async (
    docPermalink: IDocPermalink
) => {
    await putObjectToDynamo(docPermalink, DOCUMENT_PERMALINKS_TABLE);
};

export const getDocPermalink = async (
    id: string
): Promise<IDocPermalink | null> => {
    const dynamoParams = {
        TableName: DOCUMENT_PERMALINKS_TABLE,
        ProjectionExpression: 'id, userId, permalink',
        KeyConditionExpression: 'id = :did',
        ExpressionAttributeValues: {
            ':did': id
        }
    };

    const result = await dynamoDb.query(dynamoParams).promise();
    const item = result.Items.length > 0 ? result.Items[0] : null;

    return item as IDocPermalink;
};

export const createDocPermalinkIfNotExists = async (
    docPermalink: IDocPermalink
) => {
    if (!(await getDocPermalink(docPermalink.id))) {
        await updateDocPermalink(docPermalink);
    }
};

export const getDocPermalinkByPermalink = async (
    userId: string,
    permalink: string
): Promise<IDocPermalink> => {
    const dynamoParams = {
        TableName: DOCUMENT_PERMALINKS_TABLE,
        IndexName: 'userIdPermalinkIndex',
        ProjectionExpression: 'id, userId, permalink',
        KeyConditionExpression:
            'userId = :uid and permalink = :plink',
        ExpressionAttributeValues: {
            ':uid': userId,
            ':plink': permalink
        }
    };

    const result = await dynamoDb.query(dynamoParams).promise();
    return (
        result.Items &&
        result.Items.length > 0 &&
        (result.Items[0] as IDocPermalink)
    );
};

export const getUserProfileByName = async (
    name: string
): Promise<IUserProfile> => {
    const dynamoParams = {
        TableName: USER_PROFILE_TABLE,
        IndexName: 'nameIndex',
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
