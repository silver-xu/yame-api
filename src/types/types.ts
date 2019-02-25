export interface IDoc {
    id: string;
    docName: string;
    content: string;
    lastModified: Date;
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
    username: string;
    userType: UserType;
}

export enum UserType {
    Anonymous = 'Anonymous',
    Facebook = 'FB'
}

export interface IDocRepoMutation {
    newDocs: IDoc[];
    updatedDocs: IDoc[];
    deletedDocIds: string[];
}

export interface IFacebookAuthResponse {
    isValid: boolean;
    id: string;
    expiryDate: Date;
    username: string;
}
