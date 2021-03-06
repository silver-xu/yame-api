import uuidv4 from 'uuid';
import {
    IDefaultDoc,
    IDoc,
    IDocPermalink,
    IDocRepo,
    IDocRepoMutation,
    IPublishedDoc
} from '../types';
import {
    createDocPermalinkIfNotExists,
    getDocPermalinkByPermalink,
    getUserProfileByName
} from './../utils/dynamo';

export { registerUserProfile } from '../utils/dynamo';

import stream = require('stream');
import {
    deleteObjectFromS3,
    downloadStreamFromS3,
    getObjectFromS3,
    listKeysFromS3,
    putObjectToS3,
    putStreamToS3
} from '../utils/s3';
import {
    docToPdf as docToPdfStream,
    docToWord as docToWordStream
} from './doc-conversion-service';

const BUCKET = process.env.BUCKET;

export const getDefaultDoc = async (): Promise<IDefaultDoc> => {
    const defaultDoc = await getObjectFromS3<IDefaultDoc>(
        BUCKET,
        'default.json'
    );

    return defaultDoc;
};

export const getDocRepoForUser = async (
    id: string
): Promise<IDocRepo> => {
    let docKeys = await listKeysFromS3(BUCKET, `${id}/docs/`);

    // initialize Docs for new user
    if (!docKeys || docKeys.length === 0) {
        const defaultDock = await getDefaultDoc();
        const docId = uuidv4();
        await addOrUpdateDocsForUser(id, [
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

    const docs = await Promise.all(
        docKeys.map(key => getDocByKey(key))
    );

    docs.map(doc => {
        doc.published = false;
    });

    return {
        docs
    };
};

export const mutateDocRepoForUser = async (
    id: string,
    docRepoMutation: IDocRepoMutation
): Promise<void> => {
    const newAndUpdateDocsTask = addOrUpdateDocsForUser(id, [
        ...docRepoMutation.newDocs,
        ...docRepoMutation.updatedDocs
    ]);

    const deleteDocsTask = deleteDocsForUser(
        id,
        docRepoMutation.deletedDocIds
    );

    await Promise.all([newAndUpdateDocsTask, deleteDocsTask]);
};

export const getDocForUser = async (
    id: string,
    docId: string
): Promise<IDoc> => {
    const doc = await getObjectFromS3<IDoc>(
        BUCKET,
        `${id}/docs/${docId}.json`
    );

    return doc;
};

export const getDocPermalink = async (
    id: string,
    permalink: string
): Promise<IDocPermalink> => {
    return await getDocPermalinkByPermalink(id, permalink);
};

export const getPublishedDoc = async (
    username: string,
    permalink: string
): Promise<IPublishedDoc> => {
    const userProfile = await getUserProfileByName(username);

    const docPermalink = await getDocPermalinkByPermalink(
        userProfile.id,
        permalink
    );

    return {
        userId: userProfile.id,
        doc: await getDocByKey(
            `${userProfile.id}/published/${docPermalink.id}.json`
        )
    };
};

export const getPublishedDocByIds = async (
    id: string,
    docId: string
): Promise<IDoc> => {
    const doc = await getObjectFromS3<IDoc>(
        BUCKET,
        `${id}/published/${docId}.json`
    );

    return doc;
};

export const isPermalinkDuplicate = async (
    docId: string,
    userId: string,
    permalink: string
): Promise<boolean> => {
    const docPermalink = await getDocPermalinkByPermalink(
        userId,
        permalink
    );

    return docPermalink && docPermalink.id !== docId;
};

export const publishDoc = async (
    userId: string,
    doc: IDoc,
    permalink: string
): Promise<void> => {
    await putObjectToS3(
        BUCKET,
        `${userId}/published/${doc.id}.json`,
        doc
    );

    doc.published = true;

    addOrUpdateDocsForUser(userId, [doc]);

    createDocPermalinkIfNotExists({
        id: doc.id,
        permalink,
        userId
    });

    // publish PDF
    putStreamToS3(
        BUCKET,
        `${userId}/published/pdf/${doc.id}.pdf`,
        await docToPdfStream(doc)
    );

    // publish Word
    putStreamToS3(
        BUCKET,
        `${userId}/published/word/${doc.id}.docx`,
        await docToWordStream(doc)
    );
};

export const downloadPdfAsStream = (
    userId: string,
    docId: string
): stream => {
    return downloadStreamFromS3(
        BUCKET,
        `${userId}/published/pdf/${docId}.pdf`
    );
};

export const downloadWordAsStream = (
    userId: string,
    docId: string
): stream => {
    return downloadStreamFromS3(
        BUCKET,
        `${userId}/published/word/${docId}.docx`
    );
};

const getDocByKey = async (key: string): Promise<IDoc> => {
    const doc = await getObjectFromS3<IDoc>(BUCKET, key);
    return {
        ...doc,
        content: doc.content
    };
};

const addOrUpdateDocsForUser = async (
    id: string,
    docs: IDoc[]
): Promise<void> => {
    await Promise.all(
        docs.map(doc => {
            return putObjectToS3(
                BUCKET,
                `${id}/docs/${doc.id}.json`,
                doc
            );
        })
    );
};

const deleteDocsForUser = async (
    id: string,
    docsIds: string[]
): Promise<void> => {
    await Promise.all(
        docsIds.map(docId => {
            return deleteObjectFromS3(
                BUCKET,
                `${id}/docs/${docId}.json`
            );
        })
    );
};
