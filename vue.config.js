const path = require("path");
const config = require("@rancher/shell/vue.config");

module.exports = () => {
  const vendorConfig = config(__dirname, { excludes: [] });

  if (typeof vendorConfig.chainWebpack === "function") {
    const originalChainWebpack = vendorConfig.chainWebpack;

    vendorConfig.chainWebpack = (webpackConfig) => {
      originalChainWebpack(webpackConfig);
      webpackConfig.resolve.alias.set(
        "@longhorn",
        path.resolve(__dirname, "pkg/longhorn")
      );
    };
  } else {
    vendorConfig.chainWebpack = (webpackConfig) => {
      webpackConfig.resolve.alias.set(
        "@longhorn",
        path.resolve(__dirname, "pkg/longhorn")
      );
    };
  }

  return vendorConfig;
};
