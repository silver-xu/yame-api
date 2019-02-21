import {
    IDefaultDoc,
    IDoc,
    IDocRepo,
    IDocRepoFile as IDocRepoMetaData,
    IDocRepoMutation
} from '../types';
import {
    deleteObjectFromS3,
    getObjectFromS3,
    listKeysFromS3,
    putObjectToS3
} from '../utils/s3';

import { decodeAndDecompress, encodeAndCompress } from '..//utils/encoding';

const bucket = 'yame-dev';

export const getDefaultDoc = async (): Promise<IDefaultDoc> => {
    const compressedDefaultDoc = await getObjectFromS3<IDefaultDoc>(
        bucket,
        'default.json'
    );
    return {
        ...compressedDefaultDoc,
        defaultContent: decodeAndDecompress(compressedDefaultDoc.defaultContent)
    };
};

export const getDocRepoForUser = async (userId: string): Promise<IDocRepo> => {
    const keys = await listKeysFromS3(bucket, `${userId}/docs/`);
    const docRepoMetaData = await getObjectFromS3<IDocRepoMetaData>(
        bucket,
        `${userId}/meta.json`
    );
    console.log(keys);

    const docs = await Promise.all(keys.map(key => getDocForUserByKey(key)));

    return {
        docs,
        currentDocId: docRepoMetaData.currentDocId
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
        `${userId}/${docId}.json`
    );
    return {
        ...compressedDoc,
        content: decodeAndDecompress(compressedDoc.content)
    };
};

const getDocForUserByKey = async (key: string): Promise<IDoc> => {
    const compressedDoc = await getObjectFromS3<IDoc>(bucket, key);
    return {
        ...compressedDoc,
        content: decodeAndDecompress(compressedDoc.content)
    };
};

const updateDocRepoFileForUser = async (
    userId: string,
    currentDocId: string
): Promise<void> => {
    const docRepoFile: IDocRepoMetaData = {
        currentDocId
    };

    await putObjectToS3(bucket, `${userId}/meta.json`, docRepoFile);
};

const addOrUpdateDocsForUser = async (
    userId: string,
    docs: IDoc[]
): Promise<void> => {
    const compressedDocs = docs.map(doc => {
        return { ...doc, content: encodeAndCompress(doc.content) };
    });

    await Promise.all(
        compressedDocs.map(doc => {
            putObjectToS3(bucket, `${userId}/${doc.id}.json`, doc);
        })
    );
};

const deleteDocsForUser = async (
    userId: string,
    docsIds: string[]
): Promise<void> => {
    await Promise.all(
        docsIds.map(docId => {
            deleteObjectFromS3(bucket, `${userId}/${docId}.json`);
        })
    );
};
