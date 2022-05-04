const WebpackStart = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config.js')();

const compiler = WebpackStart(webpackConfig);
const devServerOptions = {...webpackConfig.devServer};
const server = new WebpackDevServer(devServerOptions, compiler);

const runServer = async () => {
    console.log('Starting server...');
    await server.start();
};

const stopServer = async () => {
    console.log('Stopping server...');
    await server.stop();
};

(async function () {
    await runServer();
})();
