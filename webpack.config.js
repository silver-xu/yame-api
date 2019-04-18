module.exports = {
  entry: ['./dist/handler.js'],
  target: 'node',
  output: {
    path: `${process.cwd()}/pack`,
    filename: 'handler.js',
    libraryTarget: 'umd'
  }
};
