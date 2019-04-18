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
const uuid_1 = __importDefault(require("uuid"));
const dynamo_1 = require("./../utils/dynamo");
var dynamo_2 = require("../utils/dynamo");
exports.registerUserProfile = dynamo_2.registerUserProfile;
const s3_1 = require("../utils/s3");
const doc_conversion_service_1 = require("./doc-conversion-service");
const BUCKET = process.env.BUCKET;
exports.getDefaultDoc = () => __awaiter(this, void 0, void 0, function* () {
    const defaultDoc = yield s3_1.getObjectFromS3(BUCKET, 'default.json');
    return defaultDoc;
});
exports.getDocRepoForUser = (id) => __awaiter(this, void 0, void 0, function* () {
    let docKeys = yield s3_1.listKeysFromS3(BUCKET, `${id}/docs/`);
    // initialize Docs for new user
    if (!docKeys || docKeys.length === 0) {
        const defaultDock = yield exports.getDefaultDoc();
        const docId = uuid_1.default();
        yield addOrUpdateDocsForUser(id, [
            {
                id: docId,
                docName: `${defaultDock.namePrefix} 1`,
                content: defaultDock.defaultContent,
                lastModified: new Date(),
                published: false,
                removed: false,
                generatePdf: true,
                generateWord: true,
                protectDoc: false
            }
        ]);
        docKeys = [`${id}/docs/${docId}.json`];
    }
    const docs = yield Promise.all(docKeys.map(key => getDocByKey(key)));
    docs.map(doc => {
        doc.published = false;
    });
    return {
        docs
    };
});
exports.mutateDocRepoForUser = (id, docRepoMutation) => __awaiter(this, void 0, void 0, function* () {
    const newAndUpdateDocsTask = addOrUpdateDocsForUser(id, [
        ...docRepoMutation.newDocs,
        ...docRepoMutation.updatedDocs
    ]);
    const deleteDocsTask = deleteDocsForUser(id, docRepoMutation.deletedDocIds);
    yield Promise.all([newAndUpdateDocsTask, deleteDocsTask]);
});
exports.getDocForUser = (id, docId) => __awaiter(this, void 0, void 0, function* () {
    const doc = yield s3_1.getObjectFromS3(BUCKET, `${id}/docs/${docId}.json`);
    return doc;
});
exports.getDocPermalink = (id, permalink) => __awaiter(this, void 0, void 0, function* () {
    return yield dynamo_1.getDocPermalinkByPermalink(id, permalink);
});
exports.getPublishedDoc = (username, permalink) => __awaiter(this, void 0, void 0, function* () {
    const userProfile = yield dynamo_1.getUserProfileByName(username);
    const docPermalink = yield dynamo_1.getDocPermalinkByPermalink(userProfile.id, permalink);
    return {
        userId: userProfile.id,
        doc: yield getDocByKey(`${userProfile.id}/published/${docPermalink.id}.json`)
    };
});
exports.getPublishedDocByIds = (id, docId) => __awaiter(this, void 0, void 0, function* () {
    const doc = yield s3_1.getObjectFromS3(BUCKET, `${id}/published/${docId}.json`);
    return doc;
});
exports.isPermalinkDuplicate = (docId, userId, permalink) => __awaiter(this, void 0, void 0, function* () {
    const docPermalink = yield dynamo_1.getDocPermalinkByPermalink(userId, permalink);
    return docPermalink && docPermalink.id !== docId;
});
exports.publishDoc = (userId, doc, permalink) => __awaiter(this, void 0, void 0, function* () {
    yield s3_1.putObjectToS3(BUCKET, `${userId}/published/${doc.id}.json`, doc);
    doc.published = true;
    addOrUpdateDocsForUser(userId, [doc]);
    dynamo_1.createDocPermalinkIfNotExists({
        id: doc.id,
        permalink,
        userId
    });
    // publish PDF
    s3_1.putStreamToS3(BUCKET, `${userId}/published/pdf/${doc.id}.pdf`, yield doc_conversion_service_1.docToPdf(doc));
    // publish Word
    s3_1.putStreamToS3(BUCKET, `${userId}/published/word/${doc.id}.docx`, yield doc_conversion_service_1.docToWord(doc));
});
exports.downloadPdfAsStream = (userId, docId) => {
    return s3_1.downloadStreamFromS3(BUCKET, `${userId}/published/pdf/${docId}.pdf`);
};
exports.downloadWordAsStream = (userId, docId) => {
    return s3_1.downloadStreamFromS3(BUCKET, `${userId}/published/word/${docId}.docx`);
};
const getDocByKey = (key) => __awaiter(this, void 0, void 0, function* () {
    const doc = yield s3_1.getObjectFromS3(BUCKET, key);
    return Object.assign({}, doc, { content: doc.content });
});
const addOrUpdateDocsForUser = (id, docs) => __awaiter(this, void 0, void 0, function* () {
    yield Promise.all(docs.map(doc => {
        return s3_1.putObjectToS3(BUCKET, `${id}/docs/${doc.id}.json`, doc);
    }));
});
const deleteDocsForUser = (id, docsIds) => __awaiter(this, void 0, void 0, function* () {
    yield Promise.all(docsIds.map(docId => {
        return s3_1.deleteObjectFromS3(BUCKET, `${id}/docs/${docId}.json`);
    }));
});
//# sourceMappingURL=doc-service.js.map