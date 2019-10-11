import { ServerInfo } from 'apollo-server';
import { playgroundOptions } from './playground-options';

const { ApolloServer } = require('apollo-server');
const { ApolloGateway } = require('@apollo/gateway');

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'swagger', url: 'http://localhost:4001/graphql' },
    { name: 'comments', url: 'http://localhost:4002/graphql' },
  ],
});

(async () => {
  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({
    schema,
    executor,
    playground: playgroundOptions,
  });

  server.listen().then(({ url }: ServerInfo) => {
    console.log(`🚀 Gateway ready at ${url}`);
  });
})();
