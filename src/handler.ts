import { APIGatewayEvent, Context } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import { createApp } from './app';

export const handler = async (
    event: APIGatewayEvent,
    context: Context
) => {
    try {
        const app = await createApp();

        const server = awsServerlessExpress.createServer(app);
        const proxy = awsServerlessExpress.proxy(
            server,
            event,
            context
        );
        return new Promise(() => proxy);
    } catch (err) {
        return new Promise(() => {
            throw err;
        });
    }
};
