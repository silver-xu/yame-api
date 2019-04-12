import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import cors = require('cors');
import express from 'express';
import fs from 'fs';
import markdownpdf from 'markdown-pdf';
import puppeteer from 'puppeteer';
import uuidv4 from 'uuid';
import { resolvers } from './data/resolvers';
import schema from './data/schema';
import { renderDoc } from './services/doc-render-service';
import { getDocForUser } from './services/doc-service';
import {
    loginUser,
    obtainAppToken
} from './services/facebook-service';
import { UserType } from './types';
import { registerUserProfile } from './utils/dynamo';
import { normalizeStrForUrl } from './utils/string';

export const createApp = async () => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));

    const fbAppAccessToken = await obtainAppToken();

    const server = new ApolloServer({
        schema,
        resolvers,
        context: async ({ req }) => {
            const token = req.headers.authorization;
            if (token) {
                if (token.startsWith('fb-')) {
                    const authToken = token.substring(3);

                    const facebookAuthResponse = await loginUser(
                        authToken,
                        fbAppAccessToken
                    );

                    const facebookUser = {
                        id: facebookAuthResponse.id,
                        userType: UserType.Facebook,
                        authToken,
                        name: normalizeStrForUrl(
                            facebookAuthResponse.name
                        )
                    };

                    await registerUserProfile({
                        id: facebookUser.id,
                        username: facebookUser.name,
                        userType: UserType.Facebook
                    });

                    return { user: facebookUser };
                } else {
                    await registerUserProfile({
                        id: token,
                        username: token,
                        userType: UserType.Anonymous
                    });

                    const anonymousUser = {
                        id: token,
                        userType: UserType.Anonymous,
                        authToken: token
                    };
                    return { user: anonymousUser };
                }
            }
        }
    });

    app.get('/ping', (req, res) => res.send('pong'));

    app.get('/serve/:userId/:docId', async (req, res) => {
        const { userId, docId } = req.params;
        const doc = await getDocForUser(userId, docId);
        res.send(renderDoc(doc));
    });

    app.get('/convert/pdf/:userId/:docId', async (req, res) => {
        const { userId, docId } = req.params;
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(
            `http://localhost:3001/serve/${userId}/${docId}`
        );
        const buffer = await page.pdf({ format: 'A4' });
        res.type('application/pdf');
        res.send(buffer);
        browser.close();
    });

    server.applyMiddleware({ app });

    return app;
};
