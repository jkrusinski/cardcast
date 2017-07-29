process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const users = require('../db/models/users.js');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server/server.js');
const bCrypt = require('bcrypt-nodejs');
const expect = chai.expect;

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

    it('should not allow duplicate users to be created', () => {
      const user = { username: 'bobby', password: 'secret' };
      return users.create(user)
        .then(() => {
          return chai.request(server)
            .post('/api/users/signup')
            .send(user)
            // make sure if the request is successful it is still sent to catch
            .then(res => { throw res; });
        })
        .catch(err => {
          expect(err).to.have.status(400);
          return users.find({ username: 'bobby' });
        })
        .then(results => {
          expect(results.length).to.eql(1);
        });
    });

    it('should hash the user\'s password', () => {
      return chai.request(server)
        .post('/api/users/signup')
        .send({ username: 'bobby', password: 'secret' })
        .then(res => {

        });
    });
  });
});
