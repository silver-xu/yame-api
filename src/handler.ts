import { APIGatewayEvent, Context } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import { createApp } from './app';

export const handler = async (event: APIGatewayEvent, context: Context) => {
    const server = awsServerlessExpress.createServer(await createApp());
    awsServerlessExpress.proxy(server, event, context);
};
