const path = require('path');

module.exports = env => {
    let devtool = env && env.production ? undefined : "source-map";
    let mode = env && env.production ? 'production' : 'development';
    return {
        entry: './src/app.ts',
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
            hot: true,
            compress: true,
            port: 9000
        },
    };
};
