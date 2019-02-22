import { GraphQLDateTime } from 'graphql-iso-date';
import uuidv4 from 'uuid/v4';
import {
    getDefaultDoc,
    getDocRepoForUser,
    mutateDocRepoForUser
} from '../services/doc-service';
import { IDocRepoMutation } from '../types';

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
        oneOffKey() {
            return uuidv4();
        },
        currentUser() {
            return mockUser;
        },
        async defaultDoc() {
            return await getDefaultDoc();
        }
    },
    Mutation: {
        async updateDocRepo(
            _: any,
            { docRepoMutation }: { docRepoMutation: IDocRepoMutation }
        ): Promise<boolean> {
            try {
                await mutateDocRepoForUser(mockUser.userId, docRepoMutation);
                return true;
            } catch (error) {
                console.log(error);
                return Promise.resolve(false);
            }
        }
    }
};
