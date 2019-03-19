export const arrayToAssociativeArray = <T>(
    arr: T[]
): { [id: string]: T } => {
    const arrObject: { [id: string]: T } = {};

    let index = 0;
    arr.forEach(value => {
        index++;
        const idsKey = ':id' + index;
        arrObject[idsKey] = value;
    });

    return arrObject;
};
