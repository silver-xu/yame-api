import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const typeDefs = `
scalar DateTime

type Query {
  docRepo: DocRepo
  oneOffKey: String
  currentUser: User
  defaultDoc: DefaultDoc
  doc(docId:String): Doc
}

type Mutation {
  updateDocRepo(docRepoMutation: DocRepoMutation): Boolean
}

type DocRepo {
  docs: [Doc]
  publishedDocIds: [String]
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
  published: Boolean
  removed: Boolean
  generatePDF: Boolean
  generateWord: Boolean
  protectDoc: Boolean
  secretPhrase: String
  protectWholdDoc: Boolean
}

type User {
  userType: UserType
  authToken: String
  id: String!
}

input DocRepoMutation{
  newDocs: [DocMutation!]
  updatedDocs: [DocMutation!]
  deletedDocIds: [String!]
}

input DocMutation{
  id: String
  docName: String
  content: String
  lastModified: DateTime
}

enum UserType {
  Anonymous
  Facebook
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
