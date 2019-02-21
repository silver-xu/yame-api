import { GraphQLDateTime } from 'graphql-iso-date';
import uuidv4 from 'uuid/v4';
import { getDefaultDoc, getDocRepoForUser } from '../services/doc-service';

const mockUser = {
    userId: 'a6624091-4237-4376-8a88-5e34424c95c6',
    email: 'foo@bar.com'
};

export const resolvers = {
    DateTime: GraphQLDateTime,
    Query: {
        async docRepo() {
            return await getDocRepoForUser(mockUser.userId);
        },
        async oneOffKey() {
            return await uuidv4();
        },
        async currentUser() {
            return await Promise.resolve(mockUser);
        },
        async defaultDoc() {
            return await getDefaultDoc();
        }
    }
};
