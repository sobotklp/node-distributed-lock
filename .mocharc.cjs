module.exports = {
  require: ['source-map-support/register', './build/test/_setup.js'],
  timeout: 10 * 1000,
  exit: true,
  spec: 'build/provider/test/**/*.test.js',
};
