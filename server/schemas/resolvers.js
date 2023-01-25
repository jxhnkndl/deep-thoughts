const { AuthenticationError } = require('apollo-server-express');
const { User, Thought, Reaction } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // get logged in user
    me: async (parent, args, context) => {
      // verify user has passed auth check
      if (context.user) {
        const { _id } = context.user.data;

        const userData = await User.findOne({ _id })
          .select('-__v -password')
          .populate('friends')
          .populate('thoughts');

        return userData;
      }

      throw new AuthenticationError('User must be logged in');
    },

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

    // add new thought
    addThought: async (parent, args, context) => {
      if (context.user) {
        const { username, _id } = context.user.data;

        // create thought
        const thought = await Thought.create({
          ...args,
          username,
        });

        // push thought into author's user data
        await User.findByIdAndUpdate(
          { _id },
          { $push: { thoughts: thought._id } },
          { new: true }
        );

        return thought;
      }

      throw new AuthenticationError('User must be logged in');
    },

    // add reaction to thought
    addReaction: async (parent, { reactionBody, thoughtId }, context) => {
      if (context.user) {
        const { username } = context.user.data;

        const updatedThought = await Thought.findByIdAndUpdate(
          { _id: thoughtId },
          { $push: { reactions: { reactionBody, username } } },
          { new: true, runValidators: true }
        );

        return updatedThought;
      }

      throw new AuthenticationError('User must be logged in');
    },

    // add friend to user profile
    addFriend: async (parent, { friendId }, context) => {
      if (context.user) {
        const { _id } = context.user.data;

        const updatedUser = await User.findByIdAndUpdate(
          { _id },
          // $addToSet because user can only be friends with another user once
          { $addToSet: { friends: friendId } },
          { new: true }
        ).populate('friends');

        return updatedUser;
      }

      throw new AuthenticationError('User must be logged in');
    },
  },
};

module.exports = resolvers;
