import {
  ApolloServer,
  delegateToSchema,
  gql,
  makeExecutableSchema,
  ServerInfo,
} from 'apollo-server';
import { transformSchemaFederation } from 'graphql-transform-federation';

const typeDefs = gql`
  type Comment {
    title: String!
    body: String!
  }

  type Pet {
    id: String
    comments: [Comment!]!
  }

  type Query {
    getPetWithCommentsById(petId: String!): Pet
  }
`;

interface PetReference {
  id: string;
}

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      getPetWithCommentsById(source, { petId }) {
        return {
          id: petId,
          comments: [
            {
              title: `comment title ${petId}`,
              body: `comment body ${petId}`,
            },
          ],
        };
      },
    },
  },
});

const federatedSchema = transformSchemaFederation(executableSchema, {
  Pet: {
    extend: true,
    keyFields: ['id'],
    fields: {
      id: {
        external: true,
      },
    },
    resolveReference(reference, context: { [key: string]: any }, info) {
      return delegateToSchema({
        schema: info.schema,
        operation: 'query',
        fieldName: 'getPetWithCommentsById',
        args: {
          petId: (reference as PetReference).id,
        },
        context,
        info,
      });
    },
  },
});

const server = new ApolloServer({
  schema: federatedSchema,
});

server.listen({ port: 4002 }).then(({ url }: ServerInfo) => {
  console.log(`🚀 Comments server ready at ${url}`);
});
