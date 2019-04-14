export interface IDoc {
    id: string;
    docName: string;
    content: string;
    lastModified: Date;
    published: boolean;
    removed: boolean;
    generatePdf: boolean;
    generateWord: boolean;
    protectDoc: boolean;
    secretPhrase?: string;
    protectWholeDoc?: boolean;
}

export interface IDocRepo {
    docs: IDoc[];
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

export interface IPublishedDoc {
    userId: string;
    doc: IDoc;
}

// tslint:disable-next-line:no-empty-interface
export interface IDocMutation extends IDoc {}

export interface IFacebookAuthResponse {
    isValid: boolean;
    id: string;
    name: string;
    expiryDate: Date;
}

export interface IDocPermalink {
    id: string;
    userId: string;
    permalink: string;
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
