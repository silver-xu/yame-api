import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import cors = require('cors');
import express from 'express';
import fs from 'fs';
import pdf from 'html-pdf';
import util from 'util';
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

    const readFileAsyc = util.promisify(fs.readFile);
    const css = await readFileAsyc('./src/css/document.css', 'utf-8');

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

    app.get('/parse/:userId/:docId', async (req, res) => {
        const { userId, docId } = req.params;
        const doc = await getDocForUser(userId, docId);

        const html = renderDoc(doc, css);
        res.send(html);
    });

    app.get('/convert/pdf/:userId/:docId', async (req, res) => {
        const { userId, docId } = req.params;
        const doc = await getDocForUser(userId, docId);

        const html = renderDoc(doc, css);
        res.setHeader('Content-type', 'application/pdf');

        pdf.create(html, {
            format: 'A4',
            border: '20px',
            footer: {
                height: '20px',
                contents: `<span style="font-size:12px">${
                    doc.docName
                }</span>`
            }
        }).toStream((_, stream) => {
            stream.pipe(res);
        });
    });

    // app.get('/convert/pdf/:userId/:docId', async (req, res) => {
    //     const { userId, docId } = req.params;
    //     const page = await browser.newPage();

    //     await page.goto(
    //         `http://localhost:3001/serve/${userId}/${docId}`
    //     );
    //     page.addStyleTag({
    //         path: './src/css/document.css'
    //     });
    //     const buffer = await page.pdf({ format: 'A4' });
    //     res.type('application/pdf');
    //     res.send(buffer);
    //     browser.close();
    // });

    server.applyMiddleware({ app });

    return app;
};
