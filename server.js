const { ApolloServer, gql } = require("apollo-server");
const resolverFunctions = require("./api/resolvers");

const typeDefs = gql`
  type ProposedChange {
    number: Int!
    practiceSlug: String
  }

  type Practice {
    title: String
    slug: String
    subtitle: String
    coverImage: String
    body: PracticeBody
    resources: [Resource]
    mediaGallery: [String]
  }

  type PracticeBody {
    whatIs: String
    whyDo: String
    howTo: String
  }

  type Resource {
    link: String
    linkType: String
    description: String
  }

  type Query {
    proposedChanges: [ProposedChange]
  }
`;

const resolvers = {
  Query: {
    proposedChanges: resolverFunctions.proposedChangesTest,
  },
  ProposedChange: {
    number(parent) {
      return parent.number;
    },
    practiceSlug(parent) {
      return resolverFunctions.getPracticeSlug(parent);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`server ready at ${url}`);
});
