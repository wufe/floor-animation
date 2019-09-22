const webpack = require( 'webpack' );

const production = process.env.NODE_ENV === "production";

const plugins = (production ? 
	[
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.DefinePlugin({
		    'process.env': {
		        'NODE_ENV': JSON.stringify( 'production' )
		    }
        })
	] :
	[]).concat([]);

const typescriptLoader = {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
        {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        }, {
            loader: 'ts-loader'
        }
    ]
};

const rules = [
    typescriptLoader
];

const config = target => ({
	mode: production ? 'production' : 'development',
	context: __dirname,
	devtool: production ? false : "source-map-loader",
	resolve: {
		extensions: [ ".ts", ".tsx", ".js" ]
	},
	entry: "./src/index.tsx",
	output: {
		path: __dirname + '/dist',
		...(target === 'umd' ? {
			filename: production ? "floor.umd.min.js" : "floor.umd.js",
			library: "Floor",
			libraryTarget: 'umd',
			pathinfo: false,
			globalObject: 'this'
		} : {
			filename: production ? "floor.min.js" : "floor.js",
			libraryTarget: 'commonjs2'
		})
		
	},
	target: 'web',
	module: {
		rules
	},
	externals: target === 'umd' ?
		{
			'react': 'react',
			'react-dom': 'react-dom',
		} : {
			'react': 'react',
			'react-dom': 'react-dom',
			'chroma-js': 'chroma-js',
			'gl-matrix': 'gl-matrix'
		},
	plugins
});

module.exports = [config('umd'), config('commonjs2')];