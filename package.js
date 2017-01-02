Package.describe({
  name: 'navybits:pagination',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'Paginate whatever you want, wherever you want, whenever you want and how much ever you want. A meteor pagination package by Navybits',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('1.4.1.1');
  api.use('ecmascript');
  api.use([
    'tap:i18n@1.8.2',
    'stevezhu:lodash@4.15.0',
    'jquery@1.11.9',
    'reactive-var@1.0.10'
    ]);
  api.use(['templating'], 'client');
  api.addFiles('pagination.html', 'client');
  api.addFiles('style.css', 'client');
  api.mainModule('client.js','client');
});

Package.onTest(function (api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('navybits:pagination');
});
