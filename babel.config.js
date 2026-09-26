module.exports = function (api) {
  api.cache(true);

  const presets = [ ['@babel/preset-env', {targets: {node: 'current'}}] ];
  const plugins = [ '@babel/preset-typescript' ];

  if (process.env["ENV"] === "prod") {
    // plugins.push(...);
  }

  return {
    presets,
    plugins
  };
}