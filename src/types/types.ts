export interface IDoc {
    id: string;
    docName: string;
    content: string;
    lastModified: Date;
}

export interface IDocRepo {
    docs: IDoc[];
    publishedDocIds: string[];
}

export interface IDefaultDoc {
    namePrefix: string;
    defaultContent: string;
}

export interface IUser {
    authToken: string;
    id: string;
    userType: UserType;
}

export enum UserType {
    Anonymous = 'Anonymous',
    Facebook = 'Facebook'
}

export interface IDocRepoMutation {
    newDocs: IDoc[];
    updatedDocs: IDoc[];
    deletedDocIds: string[];
}

// tslint:disable-next-line:no-empty-interface
export interface IDocMutation extends IDoc {}

export interface IFacebookAuthResponse {
    isValid: boolean;
    id: string;
    name: string;
    expiryDate: Date;
}

export interface IDocAccess {
    id: string;
    userId: string;
    permalink: string;
    generatePDF: boolean;
    generateWord: boolean;
    secret: string;
    protectionMode: 'A' | 'S' | undefined;
}

export interface IUserProfile {
    id: string;
    username: string;
    userType: UserType;
}

export interface IPublishResult {
    normalizedUsername: string;
    permalink: string;
}
