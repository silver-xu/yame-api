import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';
import { resolvers } from './data/resolvers';
import schema from './data/schema';

const GRAPHQL_PORT = 3001;
const graphQLServer = express();

const server = new ApolloServer({ schema, resolvers });
const app = express();
server.applyMiddleware({ app });

app.listen({ port: GRAPHQL_PORT }, () => {
    console.log(
        `GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`
    );
});

// graphQLServer.use(cors());

// graphQLServer.use(
//     '/graphql',
//     bodyParser.json(),
//     graphqlExpress(request => ({
//         schema,
//         context: { authToken: request.headers.authorization || '' }
//     }))
// );

// graphQLServer.use(
//     '/graphiql',
//     graphiqlExpress({
//         endpointURL: '/graphql'
//     })
// );

// graphQLServer.listen(GRAPHQL_PORT, () =>
//     console.log(
//         `GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`
//     )
// );
