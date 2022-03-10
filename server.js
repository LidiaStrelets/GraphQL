const app = require("express")();
const expressGraphQL = require("express-graphql").graphqlHTTP;
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
} = require("graphql");
const { authors, books } = require("./data");

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This item represents an author of a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (parent) => books.filter((b) => b.authorId === parent.id),
    },
  }),
});

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This item represents a book written by the author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (parent) => authors.find((a) => a.id === parent.authorId),
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    books: {
      type: new GraphQLList(BookType),
      description: "List of all books",
      resolve: () => books,
    },
    book: {
      type: BookType,
      description: "One book",
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
      },
      resolve: (_, { id, name }) =>
        books.find((b) => b.id === id || b.name === name),
    },
    author: {
        type: AuthorType,
        description: "One author",
        args: {
          id: { type: GraphQLInt },
          name: { type: GraphQLString },
        },
        resolve: (_, { id, name }) =>
          authors.find((b) => b.id === id || b.name === name),
      },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of all authors",
      resolve: () => authors,
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
    name:'Mutation',
    description:'Root mutation',
    fields:()=>({
         addBook:{
             type:BookType,
             description: 'Adds a new book',
             args:{
                 name:{type: GraphQLNonNull(GraphQLString)},
                 authorId:{type: GraphQLNonNull(GraphQLInt)}
             },
             resolve:(parent, args)=>{
                 books.push({...args, id: books.length-1})
                 return {...args, id: books.length-1}
             }
         }
    })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

app.use(
  "/graphQL",
  expressGraphQL({
    graphiql: true,
    schema,
  })
);
app.listen(5000, () => console.log("server is running on 5000"));
