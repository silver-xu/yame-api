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

export const createApp = async () => {
    const app = express();
    app.use(cors());

    const fbAppAccessToken = await obtainAppToken();

    const server = new ApolloServer({
        schema,
        resolvers,
        context: async ({ req }) => {
            const token = req.headers.authorization || '';
            if (token === '') {
                const authToken = uuidv4();
                const firstTimeAnonymousUser = {
                    id: authToken,
                    userType: UserType.Anonymous,
                    authToken
                };

                await registerUserProfile({
                    id: authToken,
                    username: authToken,
                    userType: UserType.Anonymous
                });

                return { user: firstTimeAnonymousUser };
            } else if (token.startsWith('fb-')) {
                const authToken = token.substring(3);

                const facebookAuthResponse = await loginUser(
                    authToken,
                    fbAppAccessToken
                );

                const facebookUser = {
                    id: facebookAuthResponse.id,
                    userType: UserType.Facebook,
                    authToken,
                    name: facebookAuthResponse.name
                };

                await registerUserProfile({
                    id: facebookUser.id,
                    username: facebookUser.name
                        .toLowerCase()
                        .split(' ')
                        .join('-'),
                    userType: UserType.Facebook
                });

                return { user: facebookUser };
            } else {
                const repeatingAnonymousUser = {
                    id: token,
                    userType: UserType.Anonymous,
                    authToken: token
                };
                return { user: repeatingAnonymousUser };
            }
        }
    });

    app.get('/ping', (req, res) => res.send('pong'));

    server.applyMiddleware({ app });

    return app;
};
