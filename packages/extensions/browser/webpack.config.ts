import CopyPlugin from 'copy-webpack-plugin';
import path from 'node:path';
import webpack from 'webpack';

const isProduction = process.env.NODE_ENV === 'production';
const mode = isProduction ? 'production' : 'development';

const buildVersion = ((): string => {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const now = new Date();
  return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(
    now.getDate()
  )}.${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`;
})();

const stampBuildVersion = (content: Buffer): string =>
  content.toString('utf8').replace(/__BUILD_VERSION__/g, buildVersion);

const versionHtmlPatterns = [
  {
    from: 'public/popup.html',
    to: 'popup.html',
    transform: { transformer: stampBuildVersion, cache: false },
  },
  {
    from: 'public/index.html',
    to: 'index.html',
    transform: { transformer: stampBuildVersion, cache: false },
  },
];

const definePlugin = new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(mode),
});

const baseConfig = {
  mode,
  devtool: isProduction ? 'source-map' : 'inline-source-map',
  entry: {
    background: './src/background.ts',
    content: './src/content.ts',
    popup: './src/popup.ts',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
    ],
  },
};

export default [
  {
    ...baseConfig,
    output: {
      path: path.resolve(__dirname, 'dist/v2'),
      filename: '[name].js',
      clean: true,
    },
    plugins: [
      definePlugin,
      new CopyPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: [
                '**/manifest/**',
                '**/rules.json',
                '**/popup.html',
                '**/index.html',
              ],
            },
          },
          ...versionHtmlPatterns,
          { from: 'public/manifest/v2/manifest.json', to: 'manifest.json' },
          { from: 'public/icons', to: 'icons' },
        ],
      }),
    ],
  },
  {
    ...baseConfig,
    output: {
      path: path.resolve(__dirname, 'dist/v3'),
      filename: '[name].js',
      clean: true,
    },
    plugins: [
      definePlugin,
      new CopyPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: ['**/manifest/**', '**/popup.html', '**/index.html'],
            },
          },
          ...versionHtmlPatterns,
          { from: 'public/manifest/v3/manifest.json', to: 'manifest.json' },
          { from: 'public/manifest/v3/rules.json', to: 'rules.json' },
          { from: 'public/icons', to: 'icons' },
        ],
      }),
    ],
  },
];
