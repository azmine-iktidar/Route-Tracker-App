module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      "babel-preset-expo",
      [
        "@babel/preset-env",
        {
          modules: "auto",
        },
      ],
    ],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
      // This ensures that CommonJS modules are transformed to ES modules
      "@babel/plugin-transform-modules-commonjs",
    ],
  };
};
