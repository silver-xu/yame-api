import uuidv4 from 'uuid';
import {
    IDefaultDoc,
    IDoc,
    IDocRepo,
    IDocRepoMutation
} from '../types';
export { updateDocumentAccess } from '../utils/dynamo';
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
    return {
        ...defaultDoc,
        defaultContent: defaultDoc.defaultContent
    };
};

export const getDocRepoForUser = async (
    id: string
): Promise<IDocRepo> => {
    let keys = await listKeysFromS3(BUCKET, `${id}/docs/`);

    // initialize Docs for new user
    if (!keys || keys.length === 0) {
        const defaultDock = await getDefaultDoc();
        await addOrUpdateDocsForUser(id, [
            {
                id: uuidv4(),
                docName: `${defaultDock.namePrefix} 1`,
                content: defaultDock.defaultContent,
                lastModified: new Date()
            }
        ]);
        keys = await listKeysFromS3(BUCKET, `${id}/docs/`);
    }

    const docs = await Promise.all(
        keys.map(key => getDocForUserByKey(key))
    );

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
    console.log(docId);
    const doc = await getObjectFromS3<IDoc>(
        BUCKET,
        `${id}/docs/${docId}.json`
    );

    return {
        ...doc,
        content: doc.content
    };
};

const getDocForUserByKey = async (key: string): Promise<IDoc> => {
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
            putObjectToS3(BUCKET, `${id}/docs/${doc.id}.json`, doc);
        })
    );
};

const deleteDocsForUser = async (
    id: string,
    docsIds: string[]
): Promise<void> => {
    await Promise.all(
        docsIds.map(docId => {
            deleteObjectFromS3(BUCKET, `${id}/docs/${docId}.json`);
        })
    );
};
