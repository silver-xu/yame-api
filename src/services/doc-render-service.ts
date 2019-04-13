import { IDoc } from '../types';

const hljs = require('highlight.js');
const MarkdownHeadingId = require('markdown-it-named-headings');
const md = require('markdown-it')({
    linkify: true,
    highlight: (str: string, lang: string) => {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(lang, str).value;
        }

        return '';
    }
}).use(MarkdownHeadingId);

export const renderDoc = (doc: IDoc, style: string): string => {
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
