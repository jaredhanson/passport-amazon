var vows = require('vows');
var assert = require('assert');
var util = require('util');
var AmazonStrategy = require('passport-amazon/strategy');


vows.describe('AmazonStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new AmazonStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
    },
    
    'should be named amazon': function (strategy) {
      assert.equal(strategy.name, 'amazon');
    },
  },
  
  'strategy when loading user profile from api': {
    topic: function() {
      var strategy = new AmazonStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // NOTE: This response is received if the user profile is requested from
      //       the following endpoint:
      //         https://api.amazon.com/user/profile
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        var body = '{"email":"jaredhanson@example.com","postal_code":"94703-1111","name":"Jared Hanson","user_id":"amzn1.account.XXX00XXXXXXXXXX0XXXXXXXXXXXX"}';
        
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'amazon');
        assert.equal(profile.id, 'amzn1.account.XXX00XXXXXXXXXX0XXXXXXXXXXXX');
        assert.equal(profile.displayName, 'Jared Hanson');
        assert.equal(profile.emails[0].value, 'jaredhanson@example.com');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile from www': {
    topic: function() {
      var strategy = new AmazonStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // NOTE: This response is received if the user profile is requested from
      //       the following endpoint:
      //         https://www.amazon.com/ap/user/profile
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        var body = '{"Request-Id":"0XXXXXXXX00X00XX0000","Profile":{"Name":"Acme Inc.","PostalCode":"11111","CustomerId":"amzn1.account.XXXXXXXXXXXXXXXXXXX00XX0X0XX","PrimaryEmail":"bob@acmeinc.com"}}';
        
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'amazon');
        assert.equal(profile.id, 'amzn1.account.XXXXXXXXXXXXXXXXXXX00XX0X0XX');
        assert.equal(profile.displayName, 'Acme Inc.');
        assert.equal(profile.emails[0].value, 'bob@acmeinc.com');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new AmazonStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
  
}).export(module);
