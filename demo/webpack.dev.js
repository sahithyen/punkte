const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = env => merge(common(env), {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        port: 9000,
        watchFiles: ['src/**/*.html', 'src/**/*.ts', 'src/**/*.css'],
    },
    watchOptions: {
        aggregateTimeout: 2000
    },
});