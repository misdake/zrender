const WebpackStart = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

let params = process.argv.slice(2);
let env = {};

params.forEach(param => {
    let index = param.indexOf("=");
    if (index >= 0) {
        let key = param.substring(0, index);
        env[key] = param.substring(index + 1);
    } else {
        env[param] = true;
    }
});

console.log(env);

const webpackConfig = require('./webpack.config.js')(env);

const compiler = WebpackStart(webpackConfig);
const devServerOptions = {...webpackConfig.devServer};
const server = new WebpackDevServer(devServerOptions, compiler);

const runServer = async () => {
    console.log('Starting server...');
    await server.start();
};

// const stopServer = async () => {
//     console.log('Stopping server...');
//     await server.stop();
// };

(async function () {
    await runServer();
})();
