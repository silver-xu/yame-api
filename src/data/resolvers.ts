import { GraphQLDateTime } from 'graphql-iso-date';
import uuidv4 from 'uuid/v4';
import {
    getDefaultDoc,
    getDocForUser,
    getDocRepoForUser,
    getPublishResult,
    mutateDocRepoForUser,
    publishDocForUser,
    updatePermalink
} from '../services/doc-service';
import {
    IDocMutation,
    IDocRepoMutation,
    IPublishResult
} from '../types';
import { getDocAccessById } from '../utils/dynamo';

export const resolvers = {
    DateTime: GraphQLDateTime,
    Query: {
        async docRepo(_: any, args: any, context: any) {
            return await getDocRepoForUser(context.user.id);
        },
        async doc(_: any, args: any, context: any) {
            return !(await getDocForUser(
                context.user.id,
                args.docId
            ));
        },
        oneOffKey(_: any, __: any, context: any) {
            return uuidv4();
        },
        currentUser(_: any, __: any, context: any) {
            return context.user;
        },
        async defaultDoc(_: any, __: any, context: any) {
            return await getDefaultDoc();
        },
        async docAccess(
            _: any,
            { id }: { id: string },
            context: any
        ) {
            return await getDocAccessById(id);
        },
        async publishResult(
            _: any,
            { id }: { id: string },
            context: any
        ) {
            return await getPublishResult(id, context.user.id);
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
        },
        async updatePermalink(
            _: any,
            { id, permalink }: { id: string; permalink: string },
            context: any
        ): Promise<boolean> {
            try {
                await updatePermalink(id, permalink);
                return true;
            } catch (error) {
                console.log(error);
                return Promise.resolve(false);
            }
        }
    }
};
