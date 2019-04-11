import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import cors = require('cors');
import express from 'express';
import fs from 'fs';
import markdownpdf from 'markdown-pdf';
import uuidv4 from 'uuid';
import { resolvers } from './data/resolvers';
import schema from './data/schema';
import { getDocForUser } from './services/doc-service';
import {
    loginUser,
    obtainAppToken
} from './services/facebook-service';
import { UserType } from './types';
import { registerUserProfile } from './utils/dynamo';
import { normalizeStrForUrl } from './utils/string';
import concatStream from 'concat-stream';

process.env.FONTCONFIG_PATH = '/var/task/fonts';

export const createApp = async () => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

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

    app.get('/convert-pdf/:userId/:docId', async (req, res) => {
        const { userId, docId } = req.params;
        const doc = await getDocForUser(userId, docId);
        const outputPath = `/tmp/${uuidv4()}.pdf`;

        markdownpdf()
            .from.string(doc.content)
            .to(outputPath, () => {
                const fileStats = fs.statSync(outputPath);

                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-length': fileStats.size,
                    'Content-Disposition': `attachment; filename=${
                        doc.docName
                    }.pdf`
                });

                const stream = fs.createReadStream(outputPath);
                stream.pipe(res);
            });
    });

    server.applyMiddleware({ app });

    return app;
};
