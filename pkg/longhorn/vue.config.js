const path = require("path");
const webpack = require("webpack");
const vendorConfigFactory = require("./.shell/pkg/vue.config");

module.exports = () => {
  const vendorConfig =
    typeof vendorConfigFactory === "function"
      ? vendorConfigFactory(__dirname)
      : vendorConfigFactory;

  const vendorConfigureWebpack = vendorConfig.configureWebpack;
  const customConfigureWebpack = (config) => {
    if (typeof vendorConfigureWebpack === "function") {
      vendorConfigureWebpack(config);
    }
    config.resolve.alias["@longhorn"] = path.resolve(__dirname);
  };

  return Object.assign({}, vendorConfig, {
    configureWebpack: customConfigureWebpack,
  });
};
