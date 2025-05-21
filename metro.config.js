// metro.config.js

const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('svg'); // Agregar "svg" como una extensión para los assets
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json', 'svg', ...config.resolver.sourceExts.filter(ext => !['js', 'jsx', 'ts', 'tsx', 'json', 'svg'].includes(ext))];

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer'); // Usar el transformador SVG

module.exports = config;
