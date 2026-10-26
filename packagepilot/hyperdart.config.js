
import pkg from './package.json' with { type: 'json' };

const hdConfig = {
  name: pkg.name,

  triggers: {
    keywords: [
      'react',
      'vue',
      'angular',
      'npm',
      'package',
      'npm package',
      'package details',
      'compare packages',
      'package alternatives',
      'npm library',
      'javascript library'
    ]
  },

  query_format: {
    regex: [
      'compare .*',
      'alternatives to .*',
      'npm package .*',
      'package details .*',
      '.*'
    ]
  },

  client: {
    location: pkg.module,
    moduleName: pkg.umdName || 'HD' + pkg.name,
    baseURL: '/' + pkg.name
  },

  format: {
    mainline: true,
    sidebar: true
  },

  permissions: {},
  info: {},
  github: '',
  demovideo: ''
};

export default hdConfig;

