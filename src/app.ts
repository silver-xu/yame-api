import { ApolloServer } from 'apollo-server-express';
import cors = require('cors');
import express from 'express';
import uuidv4 from 'uuid/v4';
import { resolvers } from './data/resolvers';
import schema from './data/schema';
import { inspectUser, obtainAppToken } from './services/facebook-service';
import { UserType } from './types';

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
                return { user: firstTimeAnonymousUser };
            } else if (token.startsWith('fb-')) {
                const authToken = token.substring(3);

                const facebookAuthResponse = await inspectUser(
                    authToken,
                    fbAppAccessToken
                );

                const facebookUser = {
                    id: facebookAuthResponse.id,
                    userType: UserType.Facebook,
                    authToken
                };

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

    server.applyMiddleware({ app });

    return app;
};
