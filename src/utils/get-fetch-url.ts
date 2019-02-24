export const getFetchUrl = (url: string, params: { [key: string]: string }) => {
    const pairs = Object.entries(params).map(
        ([key, value]) => `${key}=${value}`
    );

    return url + '?' + pairs.join('&');
};
