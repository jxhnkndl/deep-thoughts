const jwt = require('jsonwebtoken');

const secret = 'supersecret123';
const expiration = '2h';

// directly export auth middleware methods
module.exports = {
  signToken: ({ username, email, _id }) => {
    // create token payload from user object argument
    const payload = { username, email, _id };

    // sign and return token
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
