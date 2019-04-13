import { APIGatewayEvent, Context } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import { createApp } from './app';

process.env.FONTCONFIG_PATH = '/var/task/fonts';

export const handler = async (
    event: APIGatewayEvent,
    context: Context
) => {
    try {
        const app = await createApp();
        const binaryMimeTypes = [
            'application/octet-stream',
            'font/eot',
            'font/opentype',
            'font/otf',
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        const server = awsServerlessExpress.createServer(
            app,
            null,
            binaryMimeTypes
        );
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
