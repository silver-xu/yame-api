import { GraphQLDateTime } from 'graphql-iso-date';
import uuidv4 from 'uuid/v4';
import {
    getDefaultDoc,
    getDocRepoForUser,
    mutateDocRepoForUser
} from '../services/doc-service';
import { IDocRepoMutation, UserType } from '../types';

const MOCK_MODE = true;
const mockDocRepo = {
    docs: [
        {
            id: 'test 1',
            docName: 'test 1 name',
            content: 'test 1 content',
            lastModified: new Date()
        },
        {
            id: 'test 2',
            docName: 'test 2 name',
            content: 'test 2 content',
            lastModified: new Date()
        }
    ]
};

const mockDefaultDoc = {
    namePrefix: 'My document',
    defaultContent: 'defualtContent'
};

const mockUser = {
    userId: 'a6624091-4237-4376-8a88-5e34424c95c6',
    userType: UserType.Anonymous,
    authToken: uuidv4(),
    userName: 'Silver Xu'
};

export const resolvers = {
    DateTime: GraphQLDateTime,
    Query: {
        async docRepo(_: any, args: any, context: any) {
            return !MOCK_MODE
                ? await getDocRepoForUser(mockUser.userId)
                : Promise.resolve(mockDocRepo);
        },
        oneOffKey(_: any, args: any, context: any) {
            return uuidv4();
        },
        currentUser(_: any, args: any, context: any) {
            return mockUser;
        },
        async defaultDoc(_: any, args: any, context: any) {
            return !MOCK_MODE
                ? await getDefaultDoc()
                : Promise.resolve(mockDefaultDoc);
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
