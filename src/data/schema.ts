import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const typeDefs = `
scalar DateTime

type Query {
  docRepo: DocRepo
  oneOffKey: String
  currentUser: User
  defaultDoc: DefaultDoc
  docAccess(id:String): DocAccess
  publishResult(id:String): PublishResult
  doc(docId:String): Doc
  docByPermalink(username:String, permalink: String): Doc
}

type Mutation {
  updateDocRepo(docRepoMutation: DocRepoMutation): Boolean
  publishDoc(docMutation: DocMutation): PublishResult
  updateDocAccess(docAccessMutation: DocAccessMutation): Boolean
  updatePermalink(id:String, permalink:String): Boolean
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
}

type User {
  userType: UserType
  authToken: String
  id: String!
}

type PublishResult{
  normalizedUsername: String
  permalink: String
}

type DocAccess {
  id: String
  userId: String
  permalink: String
  generatePDF: Boolean
  generateWord: Boolean
  secret: String
  protectionMode: String
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

input DocAccessMutation{
  id: String
  userId: String
  permalink: String
  generatePDF: Boolean
  generateWord: Boolean
  secret: String
  protectionMode: String
  lastPublishedHash: String
}

enum UserType {
  Anonymous
  Facebook
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
