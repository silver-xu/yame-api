export interface IDoc {
    id: string;
    docName: string;
    content: string;
    lastModified: Date;
}

export interface IDocRepo {
    docs: IDoc[];
    currentDocId: string;
}

export interface IDefaultDoc {
    namePrefix: string;
    defaultContent: string;
}
