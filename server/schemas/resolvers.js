const { User, Thought } = require('../models');

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
    }
  },
};

module.exports = resolvers;
