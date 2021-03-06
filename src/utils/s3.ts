import AWS, { AWSError } from 'aws-sdk';
import {
    DeleteObjectOutput,
    PutObjectOutput
} from 'aws-sdk/clients/s3';
import { PromiseResult } from 'aws-sdk/lib/request';
import stream = require('stream');
const s3 = new AWS.S3();

export const getStringFromS3 = async (
    bucket: string,
    key: string
): Promise<string> => {
    const response = await s3
        .getObject({
            Bucket: bucket,
            Key: key
        })
        .promise();
    return response.Body.toString('utf-8');
};

export const getObjectFromS3 = async <T>(
    bucket: string,
    key: string
): Promise<T> => {
    const response = await s3
        .getObject({
            Bucket: bucket,
            Key: key
        })
        .promise();

    const stringifiedData = response.Body.toString('utf-8');
    return JSON.parse(stringifiedData) as T;
};

export const listKeysFromS3 = async (
    bucket: string,
    prefix: string
): Promise<string[]> => {
    const response = await s3
        .listObjectsV2({
            Bucket: bucket,
            Prefix: prefix
        })
        .promise();
    return response.Contents.filter(
        content => !content.Key.endsWith('/')
    ).map(content => content.Key);
};

export const putObjectToS3 = (
    bucket: string,
    key: string,
    obj: any
): Promise<PromiseResult<PutObjectOutput, AWSError>> => {
    const body = JSON.stringify(obj);
    return s3
        .putObject({
            Bucket: bucket,
            Key: key,
            Body: body
        })
        .promise();
};

export const putStreamToS3 = (
    bucket: string,
    key: string,
    body: stream
) => {
    return s3
        .upload({
            Bucket: bucket,
            Key: key,
            Body: body
        })
        .promise();
};

export const deleteObjectFromS3 = (
    bucket: string,
    key: string
): Promise<PromiseResult<DeleteObjectOutput, AWSError>> => {
    return s3
        .deleteObject({
            Bucket: bucket,
            Key: key
        })
        .promise();
};

export const downloadStreamFromS3 = (
    bucket: string,
    key: string
): stream => {
    return s3
        .getObject({ Bucket: bucket, Key: key })
        .createReadStream();
};
