const path = require('path');

module.exports = env => {
    let devtool = env && env.production ? undefined : "source-map";
    let mode = env && env.production ? 'production' : 'development';
    let open_page = env && env.open_page ? env.open_page : "index.html";
    let entry_file = env && env.entry_file ? env.entry_file : "./src/game/game.ts";
    return {
        entry: entry_file,
        devtool: devtool,
        mode: mode,
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            modules: ["ts", "node_modules"],
            extensions: ['.ts', '.js', '.html']
        },
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'app.js'
        },
        externals: {},
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            open: open_page,
            hot: true,
            compress: true,
            port: 9000
        },
    };
};
