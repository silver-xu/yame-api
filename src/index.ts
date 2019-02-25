import { ApolloServer, gql } from 'apollo-server-express';
import cors = require('cors');
import express from 'express';
import uuidv4 from 'uuid/v4';
import { resolvers } from './data/resolvers';
import schema from './data/schema';
import { UserType } from './types';

const GRAPHQL_PORT = 3001;

const app = express();
app.use(cors());

const server = new ApolloServer({
    schema,
    resolvers,
    context: ({ req }) => {
        // get the user token from the headers
        const token = req.headers.authorization || '';
        console.log(`User [${token}] requested login`);
        // try to retrieve a user with the token
        const mockUser = {
            id: 'a6624091-4237-4376-8a88-5e34424c95c6',
            userType: UserType.Facebook,
            authToken: uuidv4(),
            userName: 'Silver Xu'
        };
        // add the user to the context
        return { user: mockUser };
    }
});
server.applyMiddleware({ app });

app.listen({ port: GRAPHQL_PORT }, () => {
    console.log(
        `GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`
    );
});
