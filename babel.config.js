function resolveBabelPlugin(name) {
  const searchPaths = [
    process.cwd(),
    process.env.VUE_CLI_CONTEXT,
    '/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli'
  ].filter(Boolean);

  return require.resolve(name, { paths: searchPaths });
}

module.exports = {
  plugins: [
    resolveBabelPlugin('@babel/plugin-proposal-optional-chaining'),
    resolveBabelPlugin('@babel/plugin-proposal-nullish-coalescing-operator')
  ]
};
