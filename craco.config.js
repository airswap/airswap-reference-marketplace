// Allows configuration of create-react-app build process.
// ref: https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md
/* eslint-disable  */

const fs = require('fs');
const cracoEnvPlugin = require('craco-plugin-env');

module.exports = {
  eslint: {
    enable: true,
    mode: 'file',
    configure: (eslintConfig) => {
      eslintConfig.entry = './.eslintrc.js';
      return eslintConfig;
    },
  },
  style: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('postcss-import'),
      ],
    },
    modules: {
      localIdentName: '[path][name]__[local]--[hash:base64:5]'
    }
  },
  plugins: [
    {
      plugin: cracoEnvPlugin,
      options: {
        variables: {
          BUILD_VERSION: fs.existsSync('.git') ? require('child_process')
            .execSync('git rev-parse HEAD', { cwd: __dirname })
            .toString().trim() : 'DEV',
          BUILD_DATE: fs.existsSync('.git') ? require('child_process')
            .execSync('git show -s --format=%ci', { cwd: __dirname })
            .toString().trim() : new Date().toLocaleDateString(),
        },
      },
    },
  ],
  typescript: {
    enableTypeChecking: true,
  },
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "https://app.safe.global",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      "Access-Control-Allow-Credentials": "true"
    },
  }
};
