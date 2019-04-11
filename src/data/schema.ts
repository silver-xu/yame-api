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
  publishedDoc(username: String, permalink: String): Doc
}

type Mutation {
  updateDocRepo(docRepoMutation: DocRepoMutation): Boolean
  publishDoc(doc: DocMutation, permalink: String): Boolean
  isPermalinkDuplicate(docId: String, permalink:String): Boolean
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
  generatePdf: Boolean
  generateWord: Boolean
  protectDoc: Boolean
  secretPhrase: String
  protectWholeDoc: Boolean
}

type User {
  userType: UserType
  authToken: String
  id: String!
}

type DocPermalink {
  id: String
  permalink: String
  userId: String
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
  published: Boolean
  removed: Boolean
  generatePdf: Boolean
  generateWord: Boolean
  protectDoc: Boolean
  secretPhrase: String
  protectWholeDoc: Boolean
}

enum UserType {
  Anonymous
  Facebook
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
