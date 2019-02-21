import {
    IDefaultDoc,
    IDocRepo,
    IDocRepoFile,
    IDoc,
    IDocRepoMutation
} from '../types';
import {
    getObjectFromS3,
    listKeysFromS3,
    putObjectToS3,
    deleteObjectFromS3
} from '../utils/s3';
const lzjs = require('lzjs');
const bucket = 'yame-dev';

export const getDefaultDoc = async (): Promise<IDefaultDoc> => {
    const compressedDefaultDoc = await getObjectFromS3<IDefaultDoc>(
        bucket,
        'default.json'
    );
    return {
        ...compressedDefaultDoc,
        defaultContent: lzjs.decompress(compressedDefaultDoc.defaultContent)
    };
};

export const getDocRepoForUser = async (userId: string): Promise<IDocRepo> => {
    const keys = await listKeysFromS3(bucket, userId);
    const docRepoRecord = await getObjectFromS3<IDocRepoFile>(
        bucket,
        `${userId}/repo.json`
    );

    const docs = await Promise.all(keys.map(key => getDocForUser(userId, key)));

    return {
        docs,
        currentDocId: docRepoRecord.currentDocId
    };
};

export const mutateDocRepoForUser = async (
    userId: string,
    docRepoMutation: IDocRepoMutation
): Promise<void> => {
    const newAndUpdateDocsTask =
        docRepoMutation.newDocs || docRepoMutation.updatedDocs
            ? addOrUpdateDocsForUser(userId, [
                  ...docRepoMutation.newDocs,
                  ...docRepoMutation.updatedDocs
              ])
            : undefined;

    const deleteDocsTask = docRepoMutation.deletedDocIds
        ? deleteDocsForUser(userId, docRepoMutation.deletedDocIds)
        : undefined;

    const updateDocRepoFileTask = docRepoMutation.currentDocId
        ? updateDocRepoFileForUser(userId, docRepoMutation.currentDocId)
        : undefined;

    await Promise.all([
        newAndUpdateDocsTask,
        deleteDocsTask,
        updateDocRepoFileTask
    ]);
};

const getDocForUser = async (userId: string, docId: string): Promise<IDoc> => {
    const compressedDoc = await getObjectFromS3<IDoc>(
        bucket,
        `${userId}/${docId}`
    );
    return {
        ...compressedDoc,
        content: lzjs.decompress(compressedDoc.content)
    };
};

const updateDocRepoFileForUser = async (
    userId: string,
    currentDocId: string
): Promise<void> => {
    const docRepoFile: IDocRepoFile = {
        currentDocId
    };

    await putObjectToS3(bucket, `${userId}/`, docRepoFile);
};

const addOrUpdateDocsForUser = async (
    userId: string,
    docs: IDoc[]
): Promise<void> => {
    const compressedDocs = docs.map(doc => {
        return { ...doc, content: lzjs.compress(doc.content) };
    });

    await Promise.all(
        compressedDocs.map(doc => {
            putObjectToS3(bucket, `${userId}/${doc.id}`, doc);
        })
    );
};

const deleteDocsForUser = async (
    userId: string,
    docsIds: string[]
): Promise<void> => {
    await Promise.all(
        docsIds.map(docId => {
            deleteObjectFromS3(bucket, `${userId}/${docId}`);
        })
    );
};
