import { GraphQLDateTime } from 'graphql-iso-date';
import uuidv4 from 'uuid/v4';
import {
    getDefaultDoc,
    getDocForUser,
    getDocRepoForUser,
    mutateDocRepoForUser,
    publishDocForUser
} from '../services/doc-service';
import {
    IDocMutation,
    IDocRepoMutation,
    IPublishResult
} from '../types';

const MOCK_MODE = false;
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

const mockDoc = {
    id: 'test 1',
    docName: 'test 1 name',
    content:
        '# Heading 1\r\n## Heading 2\r\n### Heading 3\r\ncontents',
    lastModified: new Date()
};

const mockDefaultDoc = {
    namePrefix: 'My document',
    defaultContent: 'defualtContent'
};

export const resolvers = {
    DateTime: GraphQLDateTime,
    Query: {
        async docRepo(_: any, args: any, context: any) {
            return !MOCK_MODE
                ? await getDocRepoForUser(context.user.id)
                : Promise.resolve(mockDocRepo);
        },
        async doc(_: any, args: any, context: any) {
            return !MOCK_MODE
                ? await getDocForUser(context.user.id, args.docId)
                : Promise.resolve(mockDoc);
        },
        oneOffKey(_: any, args: any, context: any) {
            return uuidv4();
        },
        currentUser(_: any, args: any, context: any) {
            return context.user;
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
            {
                docRepoMutation
            }: { docRepoMutation: IDocRepoMutation },
            context: any
        ): Promise<boolean> {
            try {
                await mutateDocRepoForUser(
                    context.user.id,
                    docRepoMutation
                );
                return true;
            } catch (error) {
                console.log(error);
                return Promise.resolve(false);
            }
        },
        async publishDoc(
            _: any,
            { docMutation }: { docMutation: IDocMutation },
            context: any
        ): Promise<IPublishResult | undefined> {
            try {
                return await publishDocForUser(
                    context.user.id,
                    docMutation
                );
            } catch (error) {
                console.log(error);
                return Promise.resolve(undefined);
            }
        }
    }
};
