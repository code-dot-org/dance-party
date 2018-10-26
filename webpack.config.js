module.exports = {
  entry: {
    main: './src/index.js',
    demo: './demo.js',
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
  },
};
