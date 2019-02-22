import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const typeDefs = `
scalar DateTime

type Query {
  docRepo: DocRepo
  oneOffKey: String
  currentUser: User
  defaultDoc: DefaultDoc
}

type Mutation {
  updateDocRepo(docRepoMutation: DocRepoMutation): Boolean
}

type DocRepo {
  docs: [Doc]
}

type DefaultDoc{
  namePrefix: String
  defaultContent: String
}

type Doc {
  id: String
  docName: String
  content: String
  lastModified: DateTime
}

type User {
  userId: String
  email: String
}

input DocRepoMutation{
  newDocs: [DocMutation!]
  updatedDocs: [DocMutation!]
  deletedDocIds: [String!]
  currentDocId: String
}

input DocMutation{
  id: String
  docName: String
  content: String
  lastModified: DateTime
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
