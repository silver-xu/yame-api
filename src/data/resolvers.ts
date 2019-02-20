import { GraphQLDateTime } from 'graphql-iso-date';
import uuidv4 from 'uuid/v4';
import { IDocRepo } from '../types';

const mockDocRepo: IDocRepo = {
    docs: [
        {
            id: 'd61af891-13c8-4eeb-b767-d5d7425b59d2',
            docName: 'Mock Doc',
            content: 'Mock Content',
            lastModified: new Date()
        }
    ],
    currentDocId: 'Mock 1'
};

export const resolvers = {
    DateTime: GraphQLDateTime,
    Query: {
        docRepo() {
            return mockDocRepo;
        },
        oneOffKey() {
            return uuidv4();
        },
        currentUser() {
            return {
                userId: 'a6624091-4237-4376-8a88-5e34424c95c6',
                email: 'foo@bar.com'
            };
        },
        defaultDoc() {
            return {
                namePrefix: 'My document',
                defaultContent: 'Sample Content'
            };
        }
    }
};
