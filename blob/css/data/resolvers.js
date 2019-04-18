"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_iso_date_1 = require("graphql-iso-date");
const v4_1 = __importDefault(require("uuid/v4"));
const doc_service_1 = require("../services/doc-service");
exports.resolvers = {
    DateTime: graphql_iso_date_1.GraphQLDateTime,
    Query: {
        docRepo(_, args, context) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield doc_service_1.getDocRepoForUser(context.user.id);
            });
        },
        doc(_, args, context) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield doc_service_1.getDocForUser(context.user.id, args.docId);
            });
        },
        oneOffKey(_, __, ___) {
            return v4_1.default();
        },
        currentUser(_, __, context) {
            return context.user;
        },
        defaultDoc(_, __, ___) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield doc_service_1.getDefaultDoc();
            });
        },
        publishedDoc(_, { username, permalink }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield doc_service_1.getPublishedDoc(username, permalink);
            });
        }
    },
    Mutation: {
        updateDocRepo(_, { docRepoMutation }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield doc_service_1.mutateDocRepoForUser(context.user.id, docRepoMutation);
                    return true;
                }
                catch (error) {
                    console.log(error);
                    return Promise.resolve(false);
                }
            });
        },
        publishDoc(_, { doc, permalink }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield doc_service_1.publishDoc(context.user.id, doc, permalink);
                    return true;
                }
                catch (error) {
                    console.log(error);
                    return Promise.resolve(false);
                }
            });
        },
        isPermalinkDuplicate(_, { docId, permalink }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield doc_service_1.isPermalinkDuplicate(docId, context.user.id, permalink);
            });
        }
    }
};
//# sourceMappingURL=resolvers.js.map