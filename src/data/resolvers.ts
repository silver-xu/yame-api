import { GraphQLDateTime } from 'graphql-iso-date';
import uuidv4 from 'uuid/v4';
import {
    getDefaultDoc,
    getDocForUser,
    getDocRepoForUser,
    getPublishedDoc,
    isPermalinkDuplicate,
    mutateDocRepoForUser,
    publishDoc
} from '../services/doc-service';
import { IDoc, IDocRepoMutation } from '../types';

export const resolvers = {
    DateTime: GraphQLDateTime,
    Query: {
        async docRepo(_: any, args: any, context: any) {
            return await getDocRepoForUser(context.user.id);
        },
        async doc(_: any, args: any, context: any) {
            return await getDocForUser(context.user.id, args.docId);
        },
        oneOffKey(_: any, __: any, ___: any) {
            return uuidv4();
        },
        currentUser(_: any, __: any, context: any) {
            return context.user;
        },
        async defaultDoc(_: any, __: any, ___: any) {
            return await getDefaultDoc();
        },
        async publishedDoc(
            _: any,
            {
                username,
                permalink
            }: { username: string; permalink: string },
            __: any
        ) {
            return await getPublishedDoc(username, permalink);
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
            { doc, permalink }: { doc: IDoc; permalink: string },
            context: any
        ): Promise<boolean> {
            try {
                await publishDoc(context.user.id, doc, permalink);
                return true;
            } catch (error) {
                console.log(error);
                return Promise.resolve(false);
            }
        },
        async isPermalinkDuplicate(
            _: any,
            {
                docId,
                permalink
            }: { docId: string; permalink: string },
            context: any
        ) {
            return await isPermalinkDuplicate(
                docId,
                context.user.id,
                permalink
            );
        }
    }
};
