const express = require('express');

const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas/index');

const db = require('./config/connection');

const PORT = process.env.PORT || 3001;

// create apollo server using schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// create instance of apollo server using graphql schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();

  // add express app to apollo server as middleware
  // this creates single /graphql api endpoint
  server.applyMiddleware({ app });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`GraphQL Playground @ http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

// start apollo server
startApolloServer(typeDefs, resolvers);
