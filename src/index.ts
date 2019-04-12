import { createApp } from './app';

const GRAPHQL_PORT = 3001;

(async () => {
    (await createApp()).listen({ port: GRAPHQL_PORT }, () => {
        console.log(
            `GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`
        );
    });
})();
