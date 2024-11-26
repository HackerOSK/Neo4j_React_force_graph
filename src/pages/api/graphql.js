import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { Neo4jGraphQL } from '@neo4j/graphql';
import neo4j from 'neo4j-driver';
import gql from 'graphql-tag';

// Define the GraphQL schema
const typeDefs = gql`
  type Article {
    id: ID
    url: String
    score: Int
    title: String
    comments: String
    created: DateTime
    user : String
  }

  type User {
    username: String
    created: DateTime
    karma: Int
    about: String
    avatar: String
    articles: [Article]
  }

  type Tag {
    name: String
  }

  type Query {
    getArticles: [Article]
    getArticle(id: ID!): Article
    getUsers: [User]
    getUser(username: String!): User
    getTags: [Tag]
    getTag(name: String!): Tag
    getArticlesByTag(tagName: String!): [Article]
    getArticlesByUser(username: String!): [Article]
  }

  type Mutation {
    createArticle(
      url: String
      score: Int
      title: String
      comments: String
      created: DateTime
    ): Article
    createUser(
      username: String!
      created: DateTime
      karma: Int
      about: String
      avatar: String
    ): User
    createTag(name: String!): Tag
  }
`;

// Define resolvers for your GraphQL API
const resolvers = {
  Query: {
    getArticles: async () => {
      const session = driver.session();
      try {
        const result = await session.run('MATCH (a:Article) RETURN a.id AS id, a.url AS url, a.score AS score, a.title AS title, a.comments AS comments, a.created AS created, a.user AS user');
        return result.records.map((record) => ({
          id: record.get('id'), // Explicitly map the 'id' property
          url: record.get('url'),
          score: record.get('score'),
          title: record.get('title'),
          comments: record.get('comments'),
          created: record.get('created'),
          user: record.get('user'),
        }));
      } finally {
        await session.close();
      }
    },
    
    getArticle: async (_, { id }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (a:Article {id: $id}) RETURN a',
          { id }
        );
        return result.records[0]?.get('a').properties || null;
      } finally {
        await session.close();
      }
    },
    getUsers: async () => {
      const session = driver.session();
      try {
        const result = await session.run('MATCH (u:User) RETURN u');
        return result.records.map((record) => record.get('u').properties);
      } finally {
        await session.close();
      }
    },
    getUser: async (_, { username }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (u:User {username: $username}) RETURN u',
          { username }
        );
        return result.records[0]?.get('u').properties || null;
      } finally {
        await session.close();
      }
    },
    getTags: async () => {
      const session = driver.session();
      try {
        const result = await session.run('MATCH (t:Tag) RETURN t');
        return result.records.map((record) => record.get('t').properties);
      } finally {
        await session.close();
      }
    },
    getTag: async (_, { name }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (t:Tag {name: $name}) RETURN t',
          { name }
        );
        return result.records[0]?.get('t').properties || null;
      } finally {
        await session.close();
      }
    },
    getArticlesByTag: async (_, { tagName }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `
          MATCH (t:Tag {name: $tagName})<-[:HAS_TAG]-(a:Article)
          RETURN a
          `,
          { tagName }
        );
        return result.records.map((record) => record.get('a').properties);
      } finally {
        await session.close();
      }
    },
    getArticlesByUser: async (_, { username }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `
          MATCH (u:User {username: $username})-[:SUBMITTED]->(a:Article)
          RETURN a
          `,
          { username }
        );
        return result.records.map((record) => record.get('a').properties);
      } finally {
        await session.close();
      }
    },
  },
  Mutation: {
    createArticle: async (_, { url, score, title, comments, created }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `
          CREATE (a:Article {id: randomUUID(), url: $url, score: $score, title: $title, comments: $comments, created: $created})
          RETURN a
          `,
          { url, score, title, comments, created }
        );
        return result.records[0]?.get('a').properties || null;
      } finally {
        await session.close();
      }
    },
    createUser: async (_, { username, created, karma, about, avatar }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `
          CREATE (u:User {username: $username, created: $created, karma: $karma, about: $about, avatar: $avatar})
          RETURN u
          `,
          { username, created, karma, about, avatar }
        );
        return result.records[0]?.get('u').properties || null;
      } finally {
        await session.close();
      }
    },
    createTag: async (_, { name }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `
          CREATE (t:Tag {name: $name})
          RETURN t
          `,
          { name }
        );
        return result.records[0]?.get('t').properties || null;
      } finally {
        await session.close();
      }
    },
  },
};

// Configure Neo4j database connection
const URI = "neo4j+s://4840df7e.databases.neo4j.io";
const USER = "neo4j";
const PASSWORD = "8Jy25x7dOqmCwKPa2zrbv7eAloSQdXfx28Wh2STda8k";
const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

// Initialize Neo4jGraphQL
const neoSchema = new Neo4jGraphQL({ typeDefs, driver, resolvers });

// Create Apollo Server with Next.js integration

let server;

    // Create the Apollo server
    server = new ApolloServer({
      schema: await neoSchema.getSchema(),
      
    });
    export default startServerAndCreateNextHandler(server);
    // console.log(`🚀 Server ready at ${url}`);



