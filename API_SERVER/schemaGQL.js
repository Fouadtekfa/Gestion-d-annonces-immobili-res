const Announce = require('./model/announce');
const User = require('./model/user');
var { makeExecutableSchema } = require("@graphql-tools/schema");
const isTokenValid = require('./src/validate');
const { buildSchema } = require("graphql");

const typeDefs = `#graphql

  type Query {
    announces: [Announce]
    announceById(id: ID!): Announce
    userById(id: ID!): User
    commentsByAnnounceId(announceId: ID!): [Comment]
  }

  type Announce {
    _id: ID!
    name: String!
    type: String!
    published: Boolean!
    status: String
    description: String
    price: Float
    date: String
    photos:[Photo]
    by: String
    comments: [Comment]
  }

  type Photo {
    filename: String
    originalName: String
  }
  type Comment {
    user_id: String
    history: [CommentHistory]
  }

  type CommentHistory {
    id_user: String
    content: String
    date: String
    read: Boolean
  }

  type User {
    _id: ID!
    name: String
    first_name: String
    email: String
    password: String
    isAdmin: Boolean
  }

  type Mutation {
    createAnnounce(input: AnnounceInput!): Announce
    createCommentary(input: AddCommentInput!): Announce
    addCommentaryHistory(input: AddCommentHistoryInput!): Announce
    modifyAnnounce(input: AnnounceModifyInput!): Announce
    deleteAnnounce(id: ID): Announce
    loginUser(input: LoginUserInput): User
  }

  input LoginUserInput {
    email: String!
    first_name: String!
  }
  input AnnounceInput {
    name: String!
    type: String!
    published: Boolean!
    status: String
    description: String
    price: Float
    date: String
    photos: [PhotoInput]
    by: String
    comments: [CommentInput]
  }

  input AnnounceModifyInput {
    _id: ID!
    announce: AnnounceInput
  }

  input PhotoInput {
    filename: String
    originalName: String
  }

  input AddCommentInput {
    comment: CommentInput
    announce_id: ID
  }

  input CommentInput {
    user_id: String
    commentary: String
  }

  input historyInput {
    id_user: String
    content: String
    date: String
    read: Boolean
  }

  input AddCommentHistoryInput {
    comments: [ CommentsInput ],
    announce_id: ID
  }

  input CommentsInput {
    user_id: String
    history: [historyInput]
  }
  
`;

//const schema = makeExecutableSchema({ typeDefs, resolvers });
module.exports=typeDefs;

