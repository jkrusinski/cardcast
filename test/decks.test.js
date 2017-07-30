process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Deck = require('../db/schemas/Deck.js');
const User = require('../db/schemas/User.js');
const isValidId = mongoose.Types.ObjectId.isValid;

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server/server.js');
const _ = require('lodash');
const expect = chai.expect;

chai.use(chaiHttp);

// persist cookies across the entire test
const agent = chai.request.agent(server);

const mockUser = {
  username: 'bobby',
  password: 'secret'
};

const mockDecks = [
  {
    title: 'Morning Stand Up',
    description: 'A collection of notes for this morning\'s stand up'
  },
  {
    title: 'Evening Stand Up',
    description: 'A collection of notes for this evening\'s stand up'
  }
];


before(() => {
  // delete everything in db
  Promise.all([User.remove({}), Deck.remove({})])
    // create mock user
    .then(() => {
      return User.create(mockUser);
    })
    // add sample decks with user id
    .then((user) => {
      return Promise.all(mockDecks.map(deck => {
        return Deck.create(Object.assign({}, deck, { user: user._id }));
      }));
    });
});

describe('Deck Routes', () => {
  describe('GET /api/decks', () => {
    afterEach(() => {
      return agent.post('/api/users/logout');
    });

    it('should be a protected route', () => {
      return agent.get('/api/decks')
        .then(res => { throw res; })
        .catch((err) => {
          expect(err).to.have.status(401);
        });
    });

    it('should return the logged in user\'s decks', () => {
      return agent.post('/api/users/login')
        .send(mockUser)
        .then(() => {
          return agent.get('/api/decks');
        })
        .then((res) => {
          const userDecks = res.body;
          expect(res).to.have.status(200);
          mockDecks.forEach((deck) => {
            expect(_.find(userDecks, deck)).to.exist;
          });
        });
    });
  });

  describe('POST /api/decks', () => {
    const newDeck = {
      title: 'All-Hands Meeting',
      description: 'A few slides to put up for the all-hands meeting'
    };

    afterEach(() => {
      return agent.post('/api/users/logout');
    });

    it('should be a protected route', () => {
      return agent.post('/api/decks')
        .send(newDeck)
        .then((res) => { throw res; })
        .catch((err) => {
          expect(err).to.have.status(401);
          return Deck.findOne(newDeck);
        })
        .then((deck) => {
          expect(deck).to.be.null;
        });
    });

    it('should create a new deck for a logged in user', () => {
      return agent.post('/api/users/login')
        .send(mockUser)
        .then(() => {
          return agent.post('/api/decks').send(newDeck);
        })
        .then((res) => {
          const created = res.body;
          expect(res).to.have.status(201);
          expect(_.isMatch(created, newDeck)).to.be.true;
          expect(isValidId(created.user)).to.be.true;
          return User.findById(created.user);
        })
        .then((user) => {
          expect(user.username).to.eql(mockUser.username);
        });
    });

    it('should not allow users to post new decks without a title', () => {
      return agent.post('/api/users/login')
        .send(mockUser)
        .then(() => {
          return agent.post('/api/decks').send({ title: '' });
        })
        .then((res) => { throw res; })
        .catch((err) => {
          expect(err).to.have.status(500);
          return Deck.findOne({ title: '' });
        })
        .then((deck) => {
          expect(deck).to.be.null;
        });
    });
  });
});
