"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeStrForUrl = (input) => {
    return input
        .toLowerCase()
        .split(' ')
        .join('-');
};
//# sourceMappingURL=string.js.map