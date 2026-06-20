import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development',

  entry: {
    main: './src/main.js',
    callback: './src/auth.js'
  },
  
  output: {
    filename: '[name].js', 
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  
  resolve: {
    alias: {
      'purecloud-platform-client-v2': path.resolve(__dirname, 'node_modules/purecloud-platform-client-v2/src/purecloud-platform-client-v2')
    },
    fallback: {
      path: false,
      crypto: false,
      util: false,
      os: false,
      fs: false,
      zlib: false,
      http: false,
      https: false,
      buffer: false
    }
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: './src/auth.html',
      filename: 'auth.html',
      chunks: ['auth']
    })
  ]
};