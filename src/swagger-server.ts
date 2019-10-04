import { delegateToSchema, makeExecutableSchema } from 'graphql-tools';
import { ApolloServer } from 'apollo-server';
import { transformSchemaFederation } from 'graphql-transform-federation';
import createSchema, { CallBackendArguments } from 'swagger-to-graphql';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

function getBodyAndHeaders(
  body: any,
  bodyType: 'json' | 'formData',
  headers: { [key: string]: string } | undefined,
) {
  if (!body) {
    return { headers };
  }

  if (bodyType === 'json') {
    return {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    };
  }

  return {
    headers,
    body: new URLSearchParams(body),
  };
}

async function callBackend({
  requestOptions: { method, body, baseUrl, path, query, headers, bodyType },
}: CallBackendArguments<{}>) {
  const searchPath = query ? `?${new URLSearchParams(query)}` : '';
  const url = `${baseUrl}${path}${searchPath}`;
  const bodyAndHeaders = getBodyAndHeaders(body, bodyType, headers);

  const response = await fetch(url, {
    method,
    ...bodyAndHeaders,
  });

  const text = await response.text();
  if (response.ok) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }
  throw new Error(`Response: ${response.status} - ${text}`);
}

(async function main() {
  const schemaWithoutFederation = await createSchema({
    swaggerSchema: 'https://petstore.swagger.io/v2/swagger.json',
    callBackend,
  });

  const federationSchema = transformSchemaFederation(schemaWithoutFederation, {
    Query: {
      extend: true,
    },
    Pet: {
      keyFields: ['id'],
    },
  });

  const { url } = await new ApolloServer({
    schema: federationSchema,
  }).listen({
    port: 4001,
  });

  console.log(`🚀 Swagger server ready at ${url}`);
})();
