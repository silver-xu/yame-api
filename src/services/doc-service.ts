import uuidv4 from 'uuid';
import {
    IDefaultDoc,
    IDoc,
    IDocRepo,
    IDocRepoMutation,
    IPublishResult
} from '../types';
export {
    updateDocAccess,
    registerUserProfile
} from '../utils/dynamo';
import {
    getDocAccess,
    getDocAccessById,
    getDocAccesses,
    getUserProfileById,
    getUserProfileByName,
    updateDocAccess
} from '../utils/dynamo';

import {
    deleteObjectFromS3,
    getObjectFromS3,
    listKeysFromS3,
    putObjectToS3
} from '../utils/s3';
import { normalizeStrForUrl } from '../utils/string';

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
                lastModified: new Date()
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

    return {
        docs,
        publishedDocs
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

export const publishDocForUser = async (
    id: string,
    doc: IDoc
): Promise<IPublishResult> => {
    await putObjectToS3(
        BUCKET,
        `${id}/published/${doc.id}.json`,
        doc
    );

    const userProfile = await getUserProfileById(id);
    const docAccess = await getDocAccessById(doc.id);

    if (!docAccess) {
        const permalink = normalizeStrForUrl(doc.docName);
        let settledPermalink = permalink;

        let docAccessWithSamePermalink = await getDocAccess(
            id,
            permalink
        );

        for (
            let counter = 1;
            !!docAccessWithSamePermalink;
            counter++
        ) {
            settledPermalink = `${permalink}-${counter}`;
            docAccessWithSamePermalink = await getDocAccess(
                id,
                settledPermalink
            );
            counter++;
        }

        await updateDocAccess({
            id: doc.id,
            userId: id,
            permalink: settledPermalink,
            generatePDF: true,
            generateWord: true,
            secret: undefined,
            protectionMode: undefined
        });

        return {
            normalizedUsername: userProfile.username,
            permalink: settledPermalink
        };
    } else {
        return {
            normalizedUsername: userProfile.username,
            permalink: docAccess.permalink
        };
    }
};

export const updatePermalink = async (
    id: string,
    permalink: string
) => {
    const docAccess = await getDocAccessById(id);

    if (docAccess) {
        const docAcccessesWithSamePermalink = await getDocAccesses(
            docAccess.userId,
            permalink
        );

        if (docAcccessesWithSamePermalink.length > 1) {
            return false;
        }

        docAccess.permalink = permalink;
        await updateDocAccess(docAccess);

        return true;
    }

    return false;
};

export const getDocByNameAndPermalink = async (
    username: string,
    permalink: string
) => {
    const userProfile = await getUserProfileByName(username);
    const documentAccess = await getDocAccess(
        userProfile.id,
        permalink
    );

    return await getDocByKey(
        `${userProfile.id}/${documentAccess.id}`
    );
};

export const getDocForUser = async (
    id: string,
    docId: string
): Promise<IDoc> => {
    const doc = await getObjectFromS3<IDoc>(
        BUCKET,
        `${id}/docs/${docId}.json`
    );

    return {
        ...doc,
        content: doc.content
    };
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

export const getPublishResult = async (
    docId: string,
    userId: string
): Promise<IPublishResult | null> => {
    const docAccess = await getDocAccessById(docId);
    const userProfile = await getUserProfileById(userId);

    return {
        normalizedUsername: userProfile.username,
        permalink: docAccess.permalink
    };
};
