"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hljs = require('highlight.js');
const MarkdownHeadingId = require('markdown-it-named-headings');
const md = require('markdown-it')({
    linkify: true,
    highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(lang, str).value;
        }
        return '';
    }
}).use(MarkdownHeadingId);
exports.renderDoc = (doc, style) => {
    return `<html>
    <head>
      <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css' />
      <style>${style}</style>
    </head>
    <body class="markdown-body">
      ${md.render(doc.content)}
    </body>
  </html>`;
};
//# sourceMappingURL=doc-render-service.js.map