var webpack = require('webpack');

module.exports = config => {
  config.set({
    basePath: '',
    frameworks: ['tap', 'webpack'],
    files: [
      {pattern: 'test/integration/index.js'},
      {
        pattern: 'test/assets/sprite_sheets/**/*.*',
        watched: false,
        included: false,
        served: true,
      },
    ],
    preprocessors: {
      'test/integration/*.js': ['webpack', 'sourcemap'],
    },
    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            enforce: 'post',
            test: /\.js$/,
            exclude: [
              /(test|node_modules)\//,
              /.*src\/p5.dance.interpreted.js/,
            ],
            loader: 'coverage-istanbul-loader',
          },
        ],
      },
      resolve: {
        fallback: {
          path: require.resolve('path-browserify'),
          stream: require.resolve('stream-browserify'),
          fs: false,
        },
        extensions: ['.jsx', '.js', '.tsx', '.ts'],
      },
      plugins: [
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
      ],
    },
    reporters: ['tap-pretty', 'coverage'],

    // Run headless unless WATCH=1.
    browsers: [process.env['WATCH'] ? 'Chrome' : 'ChromeHeadless'],

    // Run and exit unless WATCH=1.
    singleRun: !process.env['WATCH'],

    // 30 seconds.
    browserNoActivityTimeout: 30 * 1000,

    // Code coverage.
    coverageReporter: {
      dir: 'coverage/integration',
      reporters: [{type: 'lcovonly'}],
    },
  });
};
