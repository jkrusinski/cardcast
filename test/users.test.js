process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const User = require('../db/schemas/User.js');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server/server.js');
const bcrypt = require('bcrypt-nodejs');
const expect = chai.expect;

chai.use(chaiHttp);

const mockUser = { username: 'bobby', password: 'secret' };

describe('User Routes', () => {
  beforeEach(() => {
    return User.remove({});
  });

  describe('POST /api/users/signup', () => {
    it('should add a new user to the database', () => {
      return chai.request(server)
        .post('/api/users/signup')
        .send(mockUser)
        .then((res) => {
          expect(res).to.have.status(201);
          return User.findOne({ username: 'bobby' });
        })
        .then(user => {
          expect(user).to.exist;
          expect(user.username).to.equal('bobby');
        });
    });

    it('should not allow duplicate User to be created', () => {
      return User.create(mockUser)
        .then(() => {
          return chai.request(server)
            .post('/api/users/signup')
            .send(mockUser)
            // make sure if the request is successful it is still sent to catch
            .then(res => { throw res; });
        })
        .catch(err => {
          expect(err).to.have.status(400);
          return User.find({ username: 'bobby' });
        })
        .then(results => {
          expect(results.length).to.eql(1);
        });
    });

    it('should hash the user\'s password', () => {
      return chai.request(server)
        .post('/api/users/signup')
        .send(mockUser)
        .then(() => {
          return User.findOne({ username: 'bobby' });
        })
        .then(user => {
          return new Promise((fulfill, reject) => {
            bcrypt.compare('secret', user.password, (err, res) => {
              if (err) {
                return reject(err);
              }

              fulfill(res);
            });
          });
        })
        .then(match => {
          expect(match).to.be.true;
        });
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(() => {
      return User.create(mockUser);
    });

    it('should login existing users in with valid credentials', () => {
      return chai.request(server)
        .post('/api/users/login')
        .send(mockUser)
        .then(res => {
          expect(res).to.have.status(201);
        });
    });

    it('should return an unauthorized status with invalid credentials', () => {
      return chai.request(server)
        .post('/api/users/login')
        .send(Object.assign({}, mockUser, { password: 'wrongpassword' }))
        .then(res => { throw rest; })
        .catch(err => {
          expect(err).to.have.status(401);
        });
    });

    it('should return a not found status if the user does not exist', () => {
      return chai.request(server)
        .post('/api/users/login')
        .send({ username: 'nonexistent', password: 'secret' })
        .then(res => { throw res; })
        .catch(err => {
          expect(err).to.have.status(404);
        });
    });
  });
});
