import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const typeDefs = `
scalar DateTime

type Query {
  docRepo: DocRepo!
  oneOffKey: String!
  currentUser: User!
  defaultDoc: DefaultDoc!
}

type DocRepo {
  docs: [Doc!]
}

type DefaultDoc{
  namePrefix: String!
  defaultContent: String!
}

type Doc {
  id: String!
  docName: String!
  content: String!
  lastModified: DateTime!
}

type User {
  userId: String!
  email: String!
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
