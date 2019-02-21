import atob from 'atob';
import btoa from 'btoa';

export const encodeAndCompress = (input: string): string => {
    return btoa(input);
};

export const decodeAndDecompress = (input: string): string => {
    return atob(input);
};
