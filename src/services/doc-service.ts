import { IDefaultDoc, IDoc, IDocRepo, IDocRepoMutation } from '../types';
import {
    deleteObjectFromS3,
    getObjectFromS3,
    listKeysFromS3,
    putObjectToS3
} from '../utils/s3';

const bucket = 'yame-dev';

export const getDefaultDoc = async (): Promise<IDefaultDoc> => {
    const compressedDefaultDoc = await getObjectFromS3<IDefaultDoc>(
        bucket,
        'default.json'
    );
    return {
        ...compressedDefaultDoc,
        defaultContent: compressedDefaultDoc.defaultContent
    };
};

export const getDocRepoForUser = async (id: string): Promise<IDocRepo> => {
    const keys = await listKeysFromS3(bucket, `${id}/docs/`);
    const docs = await Promise.all(keys.map(key => getDocForUserByKey(key)));

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

    const deleteDocsTask = deleteDocsForUser(id, docRepoMutation.deletedDocIds);

    await Promise.all([newAndUpdateDocsTask, deleteDocsTask]);
};

const getDocForUser = async (id: string, docId: string): Promise<IDoc> => {
    const doc = await getObjectFromS3<IDoc>(bucket, `${id}/${docId}.json`);
    return {
        ...doc,
        content: doc.content
    };
};

const getDocForUserByKey = async (key: string): Promise<IDoc> => {
    const doc = await getObjectFromS3<IDoc>(bucket, key);
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
            putObjectToS3(bucket, `${id}/docs/${doc.id}.json`, doc);
        })
    );
};

const deleteDocsForUser = async (
    id: string,
    docsIds: string[]
): Promise<void> => {
    await Promise.all(
        docsIds.map(docId => {
            deleteObjectFromS3(bucket, `${id}/docs/${docId}.json`);
        })
    );
};
