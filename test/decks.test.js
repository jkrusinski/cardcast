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

// used to trim off mongoose document methods for comparisons to response objects
// uses stringify to converty ObjectId's to strings
const getSimpleDeck = (match) => {
  return Deck.findOne(match)
    .then((deck) => {
      const trimmed = _.pick(deck, [
        '__v',
        '_id',
        'user',
        'title',
        'description'
      ]);
      return JSON.parse(JSON.stringify(trimmed));
    });
};

const mockUser = {
  username: 'paul',
  password: 'hollywood'
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
  afterEach(() => {
    return agent.post('/api/users/logout');
  });

  describe('GET /api/decks', () => {
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

  describe('GET /api/decks/:id', () => {
    it('should be a protected route', () => {
      return agent.get('/api/decks/597e3185363b9bc48280e6ad')
        .then((res) => { throw res; })
        .catch((err) => {
          expect(err).to.have.status(401);
        });
    });

    // TODO missing check for correct cards returned
    it('should retrieve the deck with the specified id', () => {
      return agent.post('/api/users/login')
        .send(mockUser)
        .then(() => {
          return getSimpleDeck(mockDecks[0]);
        })
        .then((target) => {
          return Promise.all([
            Promise.resolve(target),
            agent.get(`/api/decks/${target._id}`)
          ]);
        })
        .then(([target, res]) => {
          const actual = res.body.deckInfo;
          expect(actual).to.eql(target);
        });
    });
  });

  describe('PUT /api/decks/:id', () => {
    it('should be a protected route', () => {
      return agent.put('/api/decks/597e3185363b9bc48280e6ad')
        .then((res) => { throw res; })
        .catch((err) => {
          expect(err).to.have.status(401);
        });
    });

    it('should update a user\'s post', () => {
      const deckUpdate = { title: 'New Title' };
      return agent.post('/api/users/login')
        .send(mockUser)
        .then(() => {
          return getSimpleDeck(mockDecks[0]);
        })
        .then((target) => {
          return Promise.all([
            Promise.resolve(target),
            agent.put(`/api/decks/${target._id}`).send(deckUpdate)
          ]);
        })
        .then(([target, res]) => {
          expect(res).to.have.status(204);
          return Deck.findById(target._id);
        })
        .then((actual) => {
          expect(actual.title).to.eql(deckUpdate.title);
        });
    });
  });
});

describe('DELETE /api/decks/:id', () => {
  it('should be a protected route', () => {
    return agent.delete('/api/decks/597e3185363b9bc48280e6ad')
      .then((res) => { throw err; })
      .catch((err) => {
        expect(err).to.have.status(401);
      });
  });

  it('should delete a user\'s post', () => {
    return agent.post('/api/users/login')
      .send(mockUser)
      .then(() => {
        return getSimpleDeck(mockDecks[0]);
      })
      .then((target) => {
        return Promise.all([
          Promise.resolve(target),
          agent.delete(`/api/decks/${target._id}`)
        ]);
      })
      .then(([target, res]) => {
        expect(res).to.have.status(204);
        return Deck.findById(target._id);
      })
      .then((actual) => {
        expect(actual).to.be.null;
      });
  });
});
