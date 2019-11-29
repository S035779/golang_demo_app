module.exports = {
  plugins: {
    'postcss-easy-import': { glob: true }
  , 'postcss-preset-env': { browsers: 'last 2 versions' }
  , 'css-declaration-sorter': { order: 'smacss' }
  , 'cssnano': {}
  } 
};
