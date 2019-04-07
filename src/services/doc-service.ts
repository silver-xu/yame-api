import uuidv4 from 'uuid';
import {
    IDefaultDoc,
    IDoc,
    IDocRepo,
    IDocRepoMutation,
    IDocPermalink
} from '../types';
import {
    createDocPermalinkIfNotExists,
    getDocPermalinkByPermalink
} from './../utils/dynamo';

export { registerUserProfile } from '../utils/dynamo';

import {
    deleteObjectFromS3,
    getObjectFromS3,
    listKeysFromS3,
    putObjectToS3
} from '../utils/s3';

const BUCKET = 'yame-dev';

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
    const publishedDocKeys = await listKeysFromS3(
        BUCKET,
        `${id}/published/`
    );

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
                generatePDF: true,
                generateWord: true,
                protectDoc: false
            }
        ]);

        docKeys = [`${id}/docs/${docId}.json`];
    }

    const docs = await Promise.all(
        docKeys.map(key => getDocByKey(key))
    );

    const publishedDocs = await Promise.all(
        publishedDocKeys.map(key => getDocByKey(key))
    );

    docs.map(doc => {
        doc.published = false;
    });

    docs.filter(doc =>
        publishedDocs.find(publishedDoc => doc.id === publishedDoc.id)
    ).forEach(doc => {
        doc.published = true;
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
    doc: IDoc
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
        permalink: doc.docName,
        userId
    });
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
