export const normalizeStrForUrl = (input: string): string => {
    return input
        .toLowerCase()
        .split(' ')
        .join('-');
};
