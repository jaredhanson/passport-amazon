var vows = require('vows');
var assert = require('assert');
var util = require('util');
var amazon = require('passport-amazon');


vows.describe('passport-amazon').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(amazon.version);
    },
  },
  
}).export(module);
