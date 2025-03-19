// metro.config.js

const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('svg'); // Agregar "svg" como una extensión para los assets
config.resolver.sourceExts.push('svg'); // Agregar "svg" como una extensión para los source files

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer'); // Usar el transformador SVG

module.exports = config;
