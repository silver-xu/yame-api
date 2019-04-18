var nodeModules = {
    'html-pdf':'commonjs html-pdf'
};

module.exports = {
    entry: ['./dist/handler.js'],
    target: 'node',
    externals: nodeModules,
    output: {
        path: `${process.cwd()}/pack`,
        filename: 'handler.js',
        libraryTarget: 'umd'
    }
};
