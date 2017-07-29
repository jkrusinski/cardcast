process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var users = require('../db/models/users.js');

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server/server.js');
var expect = chai.expect;

chai.use(chaiHttp);

describe('Users', () => {
  beforeEach(() => {
    return users.remove({});
  });

  describe('POST /api/users/signup', () => {
    it('should add a new user to the database', () => {
      return chai.request(server)
        .post('/api/users/signup')
        .send({ username: 'bobby', password: 'secret' })
        .then((res) => {
          expect(res).to.have.status(201);
          return users.findOne({ username: 'bobby' });
        })
        .then(user => {
          expect(user).to.exist;
          expect(user.username).to.equal('bobby');
        });
    });
  });
});
