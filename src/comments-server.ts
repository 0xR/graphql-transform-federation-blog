import {
  ApolloServer,
  delegateToSchema,
  gql,
  makeExecutableSchema,
  ServerInfo,
} from 'apollo-server';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  FieldNode,
} from 'graphql';
import { transformSchemaFederation } from 'graphql-transform-federation';

const typeDefs = gql`
  type Comment {
    title: String!
    body: String!
  }

  type Query {
    getCommentsForPet(petId: String!): [Comment!]!
  }
`;

interface ProductReference {
  id: string;
}

const executableSchemaConfig = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      getCommentsForPet(source, { petId }) {
        return [
          {
            title: `comment title ${petId}`,
            body: `comment body ${petId}`,
          },
        ];
      },
    },
  },
}).toConfig();

if (!executableSchemaConfig.query) {
  throw new Error('Schema should have a query type');
}

const schemaWithPetType = new GraphQLSchema({
  ...executableSchemaConfig,
  types: [
    ...executableSchemaConfig.types,
    new GraphQLObjectType({
      name: 'Pet',
      fields: {
        id: { type: GraphQLString },
        comments: {
          type: executableSchemaConfig.query.getFields().getCommentsForPet.type,
          resolve(source, context, args, info) {
            return delegateToSchema({
              schema: info.schema,
              operation: 'query',
              fieldName: 'getCommentsForPet',
              args: {
                petId: source.id,
              },
              context,
              info,
            });
          },
        },
      },
    }),
  ],
});

const federatedSchema = transformSchemaFederation(schemaWithPetType, {
  Pet: {
    extend: true,
    keyFields: ['id'],
    fields: {
      id: {
        external: true,
      },
    },
  },
});

const server = new ApolloServer({
  schema: federatedSchema,
});

server.listen({ port: 4002 }).then(({ url }: ServerInfo) => {
  console.log(`🚀 Comments server ready at ${url}`);
});
