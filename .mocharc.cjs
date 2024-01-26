module.exports = {
  require: ['source-map-support/register', './build/test/_setup.js'],
  timeout: 10 * 1000,
  exit: true,
  spec: 'build/test/**/*.test.js',
};
