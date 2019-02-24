import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import schema from './data/schema';

const GRAPHQL_PORT = 3001;
const graphQLServer = express();

graphQLServer.use(cors());

graphQLServer.use(
    '/graphql',
    bodyParser.json(),
    graphqlExpress(request => ({
        schema,
        context: { authToken: request.headers.authorization || '' }
    }))
);

graphQLServer.use(
    '/graphiql',
    graphiqlExpress({
        endpointURL: '/graphql'
    })
);

graphQLServer.listen(GRAPHQL_PORT, () =>
    console.log(
        `GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`
    )
);
