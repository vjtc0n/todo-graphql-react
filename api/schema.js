import {makeExecutableSchema} from 'graphql-tools';
import {pubsub} from './subscriptions';
import db from './db'
import _ from 'lodash'

const rootSchema = [`
  type Post {
    id: Int!
    title: String!
    content: String!
  }
  type Query {
    # List all posts
    posts: [Post]
  }
  type Mutation {
    addPost(title: String!, content: String!): Post
  }
  type Subscription {
    # Subscription fires on every comment added
    postAdded: Post
  }
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`];

const rootResolvers = {
  Query: {
    posts(root, args, context) {
      return db.get()
    }
  },
  Mutation: {
    addPost(root, {
      title,
      content
    }, context) {
      // if (!context.user) {
      //   throw new Error('Must be logged in to submit a comment.');
      // }
      // return a value or a Promise
      var post = db.add(title, content);
      pubsub.publish('postAdded', post);
      return post;
    }
  },
  Subscription: {
    // TODO: Parameter?
    postAdded(post) {
      // the subscription payload is the comment.
      return post;
    }
  }
};

const schema = [...rootSchema];
const resolvers = _.merge(rootResolvers);

const executableSchema = makeExecutableSchema({typeDefs: schema, resolvers});

export default executableSchema;
