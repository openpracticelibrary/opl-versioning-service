const { ApolloServer, gql } = require("apollo-server");
const resolverFunctions = require("./api/resolvers");

const typeDefs = gql`
  type ProposedChange {
    number: Int!
    practiceSlug: String
    mergeable: String
  }

  type Diff {
    diff: String
  }

  type Practice {
    title: String
    slug: String
    coverImage: String
    authors: [Author]
    subtitle: String
    body: PracticeBody
    resources: [Resource]
    mediaGallery: [Link]
    tags: [Tag]
    ama: [Question]
    upvotes: Int
  }

  input ProposedChangeInput {
    title: String
    slug: String
    coverImage: String
    authors: [AuthorInput]
    subtitle: String
    body: PracticeBodyInput
    resources: [ResourceInput]
    mediaGallery: [LinkInput]
    tags: [TagInput]
    ama: [QuestionInput]
    upvotes: Int
  }

  type Link {
    link: String
  }

  input LinkInput {
    link: String
  }

  type Question {
    question: String
  }

  input QuestionInput {
    question: String
  }

  type Tag {
    tag: String
  }

  input TagInput {
    tag: String
  }

  type Author {
    avatar: String
    firstName: String
    lastName: String
    mediaLink: String
  }

  input AuthorInput {
    avatar: String
    firstName: String
    lastName: String
    mediaLink: String
  }

  input PracticeBodyInput {
    whatIs: String
    whyDo: String
    howTo: String
  }

  type PracticeBody {
    whatIs: String
    whyDo: String
    howTo: String
  }

  input ResourceInput {
    link: String
    linkType: String
    description: String
  }

  type Resource {
    link: String
    linkType: String
    description: String
  }

  type Query {
    proposedChanges: [ProposedChange]
    proposedChange(pullRequestNumber: Int!): Practice
    getDiff(pullRequestNumber: Int!): Diff
  }

  type Mutation {
    submitChange(proposedChange: ProposedChangeInput!): Response
  }

  type Response {
    response: String
  }
`;

const resolvers = {
  Mutation: {
    submitChange(parent, args, context, info) {
      return resolverFunctions.proposeChange(
        {
          username: "testingApp",
          email: "testingApp@test.com",
        },
        args.proposedChange
      );
    },
  },
  Query: {
    proposedChanges: resolverFunctions.proposedChanges,
    proposedChange(parent, args, context, info) {
      return resolverFunctions.getProposedChange(args.pullRequestNumber);
    },
    getDiff(parent, args, context, info) {
      return resolverFunctions.getDiffFromPullRequest(args.pullRequestNumber);
    },
  },
  ProposedChange: {
    number(parent) {
      return parent.number;
    },
    practiceSlug(parent) {
      return parent.practiceSlug;
    },
    mergeable(parent) {
      return resolverFunctions.getMergeableStatus(parent);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`server ready at ${url}`);
});
