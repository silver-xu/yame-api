import AWS from 'aws-sdk';
import atob from 'atob';
import { IDefaultDoc } from '../types';

const s3 = new AWS.S3();

export const getDefaultDoc = async (): Promise<IDefaultDoc> => {
    const data = await s3
        .getObject({
            Bucket: 'yame-dev',
            Key: 'default.json'
        })
        .promise();

    const stringifiedDefaultDoc = data.Body.toString('utf-8');
    const encodedDefaultDoc = JSON.parse(stringifiedDefaultDoc);

    return {
        namePrefix: encodedDefaultDoc.namePrefix as string,
        defaultContent: atob(encodedDefaultDoc.defaultContent)
    };
};

(async () => {
    const data = await getDefaultDoc();
    console.log(data);
})();
