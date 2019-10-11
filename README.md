# `npm run start:watch`

Starts a [swagger server](./src/swagger-server.ts), a
[comments server](./src/comments-server.ts) and a [gateway](./src/gateway.ts) on
[localhost:4000](http://localhost:4000). The swagger server uses
[graphql-transform-federation](https://github.com/0xR/graphql-transform-federation)
to add federation to a
[swagger-to-graphql](https://github.com/yarax/swagger-to-graphql) schema. The
comments server transforms a regular GraphQL schema to add federation.

Opening [localhost:4000](http://localhost:4000) shows a GraphQL playground with
a tab for each server. There are sample queries to what is going on.
