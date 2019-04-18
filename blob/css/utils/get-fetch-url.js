"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFetchUrl = (url, params) => {
    const pairs = Object.entries(params).map(([key, value]) => `${key}=${value}`);
    return url + '?' + pairs.join('&');
};
//# sourceMappingURL=get-fetch-url.js.map