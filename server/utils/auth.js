const jwt = require('jsonwebtoken');

const secret = 'supersecret123';
const expiration = '2h';

// directly export auth middleware methods
module.exports = {
  // authenticate user credentials from req headers
  authMiddleware: ({ req }) => {
    let token =
      req.body.token || req.query.token || req.headers.authorization;

    // remove 'Bearer' from token string
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    // if no token was sent, pass req to resolver as is
    if (!token) {
      return req;
    }

    try {
      // decode token and attach user data to req
      const data = jwt.verify(token, secret, { maxAge: expiration });

      req.user = data;
    } catch (error) {
      console.log('Invalid token');
    }

    // pass updated req with user data to resolver
    return req;
  },

  // generate and sign web token
  signToken: ({ username, email, _id }) => {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
