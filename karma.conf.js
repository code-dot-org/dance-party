module.exports = config => {
  config.set({
    basePath: '',
    frameworks: ['tap'],
    files: [
      {pattern: 'test/integration/index.js'},
    ],
    preprocessors: {
      'test/integration/*.js': ['webpack', 'sourcemap'],
    },
    webpack: {
      node: {
        fs: 'empty',
      },
      // Uncomment when debugging
      // devtool: 'inline-source-map',
      module: {
        rules: [{
          enforce: 'post',
          test: /\.js$/,
          exclude: [
            /(test|node_modules)\//,
            'src/p5.dance.interpreted.js',
          ],
          loader: 'istanbul-instrumenter-loader'
        }]
      }
    },
    reporters: ['tap-pretty', 'coverage'],

    // Run headless unless WATCH=1.
    browsers: process.env['WATCH'] ? ['Chrome'] : ['ChromeHeadless', 'ChromeHeadlessNoSandbox'],

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },

    // Run and exit unless WATCH=1.
    singleRun: !process.env['WATCH'],

    // 30 seconds.
    browserNoActivityTimeout: 30 * 1000,

    // Code coverage.
    coverageReporter: {
      dir: 'coverage/integration',
      reporters: [
        {type: 'lcovonly'},
      ],
    },
  });
};
