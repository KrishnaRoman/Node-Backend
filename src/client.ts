import { GraphQLClient } from "graphql-request";

export const client = new GraphQLClient("https://pleasing-stag-47.hasura.app/v1/graphql", {
  headers: { "x-hasura-admin-secret": "zbBHgSPKclNupJYEF3X3IHevWiTQHMRgeOrvyK8cfZ2c6BcdVtwaN3W6tV74DnD9" },
});
