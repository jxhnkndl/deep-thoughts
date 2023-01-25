const { AuthenticationError } = require('apollo-server-express');
const { User, Thought } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // get all users
    users: async () => {
      return User.find()
        .select('-__v -password')
        .populate('friends')
        .populate('thoughts');
    },

    // get single user by username
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select('-__v -password')
        .populate('friends')
        .populate('thoughts');
    },

    // get all thoughts or all of single user's thoughts
    thoughts: async (parent, { username }) => {
      // assign username to params if user provided it
      const params = username ? { username } : {};

      // find all thoughts
      // if username is provided, find all thoughts for user
      return Thought.find(params).sort({ createdAt: -1 });
    },

    // get single thought by id
    thought: async (parent, { _id }) => {
      return Thought.findOne({ _id });
    },
  },

  Mutation: {
    // login
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const isCorrectPw = await user.isCorrectPassword(password);

      if (!isCorrectPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },

    // create new user
    addUser: async (parent, args) => {
      const user = await User.create(args);

      const token = signToken(user);

      return { token, user };
    },
  },
};

module.exports = resolvers;
