import { GraphQLDateTime } from 'graphql-iso-date';
import uuidv4 from 'uuid/v4';
import {
    getDefaultDoc,
    getDocForUser,
    getDocRepoForUser,
    mutateDocRepoForUser
} from '../services/doc-service';
import { IDocRepoMutation } from '../types';

export const resolvers = {
    DateTime: GraphQLDateTime,
    Query: {
        async docRepo(_: any, args: any, context: any) {
            return await getDocRepoForUser(context.user.id);
        },
        async doc(_: any, args: any, context: any) {
            return await getDocForUser(context.user.id, args.docId);
        },
        oneOffKey(_: any, __: any, context: any) {
            return uuidv4();
        },
        currentUser(_: any, __: any, context: any) {
            return context.user;
        },
        async defaultDoc(_: any, __: any, context: any) {
            return await getDefaultDoc();
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
        }
    }
};
