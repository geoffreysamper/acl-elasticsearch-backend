'use strict';

var Elasticsearch = require('elasticsearch');
var AclEsBackend = require('../lib');
var Acl = require('acl');

var client = new Elasticsearch.Client({
  apiVersion: '1.7',
  hosts: ['localhost:9200'],
  log: 'trace',
  keepAlive: true,
  maxSockets: 100,
  minSockets: 100
});
client.indices.putTemplate({
  name: 'acltest-template',
  body: {
    template: 'acltest',
    mappings: {
      _default_: {
        dynamic_templates: [
          {
            string_fields: {
              match: '*',
              match_mapping_type: 'string',
              mapping: {
                type: 'string',
                index: 'not_analyzed'
              }
            }
          }
        ]
      }
    }
  }
}, function(err, resp) {
  if (err) {
    throw new Error(err);
  }
  var aclEsBackend = new AclEsBackend({
    client: client,
    index: 'acltest',
    prefix: 'test_',
    refresh: true,
    size: 1000
  });
  var acl = new Acl(aclEsBackend);
  acl.addUserRoles('Joe', ['Admin', 'Moderator'], function(err) {
    if (err) {
      throw new Error(err);
    }
    acl.userRoles('Joe', function(err, roles) {
      console.log('Joe user roles are: ', roles);
    });
  });
});