const path = require('path');
const config = require('@rancher/shell/vue.config');

module.exports = () => {
  const vendorConfig = config(__dirname, { excludes: [] });

  if (typeof vendorConfig.chainWebpack === 'function') {
    const originalChainWebpack = vendorConfig.chainWebpack;

    vendorConfig.chainWebpack = (webpackConfig) => {
      originalChainWebpack(webpackConfig);
      webpackConfig.resolve.alias.set('@longhorn', path.resolve(__dirname, 'pkg/longhorn'));
      webpackConfig.resolve.alias.set('vuex', path.resolve(__dirname, 'node_modules/vuex'));
      webpackConfig.resolve.alias.set('vue-i18n', path.resolve(__dirname, 'node_modules/vue-i18n'));
    };
  } else {
    vendorConfig.chainWebpack = (webpackConfig) => {
      webpackConfig.resolve.alias.set('@longhorn', path.resolve(__dirname, 'pkg/longhorn'));
      webpackConfig.resolve.alias.set('vuex', path.resolve(__dirname, 'node_modules/vuex'));
      webpackConfig.resolve.alias.set('vue-i18n', path.resolve(__dirname, 'node_modules/vue-i18n'));
    };
  }

  return vendorConfig;
};
