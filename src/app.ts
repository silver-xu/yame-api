import { ApolloServer } from 'apollo-server-express';
import cors = require('cors');
import express from 'express';
import uuidv4 from 'uuid/v4';
import { resolvers } from './data/resolvers';
import schema from './data/schema';
import {
    loginUser,
    obtainAppToken
} from './services/facebook-service';
import { UserType } from './types';
import { registerUserProfile } from './utils/dynamo';
import { normalizeStrForUrl } from './utils/string';

process.env.FONTCONFIG_PATH = '/var/task/fonts';

export const createApp = async () => {
    const app = express();
    app.use(cors());

    const fbAppAccessToken = await obtainAppToken();

    const server = new ApolloServer({
        schema,
        resolvers,
        context: async ({ req }) => {
            const token = req.headers.authorization || '';
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
    });

    app.get('/ping', (req, res) => res.send('pong'));

    server.applyMiddleware({ app });

    return app;
};
