## GraphQL API:

The structure of a GraphQL query can be dynamically altered
via [directives]. As GQL query parameters are assigned
dynamically via variables, directives provide the same
facility but operate above their defined scope and control
what is executed within a field, fragment or an entire
query/mutation.

AWS provides seven custom directives that act like shortcuts
to link AWS IaaS services to your GraphQL API

## [Custom AWS Directives]


[@model]: 

store objects of this type in DynamoDB and automatically
configure CRUDL queries and mutations:
- `C`reate: via`get<type>` (e.g., `getOrder`)
- `R`ead:
- `U`pdate:
- `D`elete:
- `L`ist:

[@key]: 

DynamoDB custom index structure for @model types, e.g.:
```graphql
# definition...
type Order 
  # creates boilerplate CRUDL graphql schema operations
  @model 
  # generates DynamoDB [ primary, sort ] composite key
  @key(fields: [
    # first val = primary index/key
    "customerEmail", 
    # second val = sort key
    "createdAt"
  ]) {
    customerEmail: String!
    createdAt: String!
    orderId: ID!
}

# use...
query ListOrdersForCustomerIn2019 {
  # listOrders autogen'd by `@model` above
  listOrders(
    # query primary key (single ms lookup)
    customerEmail:"me@email.com", 
    # sort key
    # may use gt, ge, lt, le, eq, beginsWith, and between
    createdAt: { beginsWith: "2019" }
  ) {
    items {
      orderId
      customerEmail
      createdAt
    }
  }
}
```

 DynamoDB limits you to query by at most two attributes at a
time, so the `@key` directive helps by streamlining the
process of creating composite sort keys such that you can
support querying by more than two attributes at a time. 

```graphql
# define...
type Item 
  @model
  # here composite keys are injected during queries/mutations
  # e.g., "Get items by order, status *and* createdAt"
  @key(
    fields: [
      "orderId", 
      # 2nd and 3rd fields are composited (`status#createdAt`)
      "status", 
      "createdAt"
    ]
  )
  # generate *another* key for model (more conventional)
  @key( 
    name: "ByStatus", 
    fields: [ "status", "createdAt" ], 
    queryField: "itemsByStatus"
  ) {
  orderId: ID!
  status: Status!
  createdAt: AWSDateTime!
  name: String!
}

enum Status {
  DELIVERED
  IN_TRANSIT
  PENDING
  UNKNOWN
}

# use...
query ListInTransitItemsForOrder {
  listItems(
    orderId:"order1", 
    statusCreatedAt: { 
      beginsWith: { status: IN_TRANSIT, createdAt: "2019" }
    }
  ) {
    items {
      orderId
      status
      createdAt
      name
    }
  }
}
```

As you can see, you can also add multiple `@key` directives
to a single model to enable multiple access patterns (beware
this will also create unique entities in the DB and the
associated costs)

[@auth]: 

allows fine-grained access control, e.g.:

```graphql

# The simplest case (abbreviated syntax)
type Post 
  # autogen CRUDL
  @model 
  @auth( rules: [
  { allow: owner 
  # default: `ownerField: "owner"`
  }]) {
  id: ID!
  title: String!
}

# The long form way
type Post
  @model
  @auth( rules: [
  { allow: owner
  # ownerField will be injected at runtime!
  , ownerField: "owner" 
  # anything that's not listed isn't protected
  , operations: [ read, create, update, delete ] 
  }]) {
  id: ID!
  title: String!
  owner: String
}
```

in the long form example above, here's what's protected:

who       | get  | list | create | update | delete
---       | :--: | :--: | :--:   | :--:   | :--:
owner     | ✔️   | ✔️  | ✔️     | ✔️     | ✔️
non-owner | ✖    | ✖   | ✔️*    | ✖      | ✖

```sh
# key
✔️  > access allowed
✔️* > access allowed only for associating owner with item
✖   > access denied
```
in other words:
- `read`: If the record’s owner is not the same as the
  logged in user (via `$ctx.identity.username`), throw
  `$util.unauthorized()` in any resolver that returns an
  object of this type (`getPost` + `listPosts`).

- `create`: Inject the logged in user’s
  `$ctx.identity.username` as the `ownerField`
  automatically. 

- `update`: Add conditional update that checks the stored
  `ownerField` is the same as `$ctx.identity.username`.

- `delete`: Add conditional update that checks the stored
  `ownerField` is the same as `$ctx.identity.username`.

[@function]:
fa

[@connection]
fa

[@versioned]:
fa

[@searchable]
fa

### Dig Deeper:

- DynamoDB [Access Patterns] via GraphQL
- learn more [about directives]

## YouTube Tutorials/Trainings

- Building [Robust GraphQL APIs] with aWS Amplify and AWS AppSync 
- AWS Amplify [Serverless GraphQL React] workshop by Nader Dabit 
  - follow along with the [talk repo]

## Amplify CLI IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Sid": "VisualEditor0",
          "Effect": "Allow",
          "Action": [
              "appsync:*",
              "apigateway:POST",
              "apigateway:DELETE",
              "apigateway:PATCH",
              "apigateway:PUT",
              "cloudformation:CreateStack",
              "cloudformation:CreateStackSet",
              "cloudformation:DeleteStack",
              "cloudformation:DeleteStackSet",
              "cloudformation:DescribeStackEvents",
              "cloudformation:DescribeStackResource",
              "cloudformation:DescribeStackResources",
              "cloudformation:DescribeStackSet",
              "cloudformation:DescribeStackSetOperation",
              "cloudformation:DescribeStacks",
              "cloudformation:UpdateStack",
              "cloudformation:UpdateStackSet",
              "cloudfront:CreateCloudFrontOriginAccessIdentity",
              "cloudfront:CreateDistribution",
              "cloudfront:DeleteCloudFrontOriginAccessIdentity",
              "cloudfront:DeleteDistribution",
              "cloudfront:GetCloudFrontOriginAccessIdentity",
              "cloudfront:GetCloudFrontOriginAccessIdentityConfig",
              "cloudfront:GetDistribution",
              "cloudfront:GetDistributionConfig",
              "cloudfront:TagResource",
              "cloudfront:UntagResource",
              "cloudfront:UpdateCloudFrontOriginAccessIdentity",
              "cloudfront:UpdateDistribution",
              "cognito-identity:CreateIdentityPool",
              "cognito-identity:DeleteIdentityPool",
              "cognito-identity:DescribeIdentity",
              "cognito-identity:DescribeIdentityPool",
              "cognito-identity:SetIdentityPoolRoles",
              "cognito-identity:UpdateIdentityPool",
              "cognito-idp:CreateUserPool",
              "cognito-idp:CreateUserPoolClient",
              "cognito-idp:DeleteUserPool",
              "cognito-idp:DeleteUserPoolClient",
              "cognito-idp:DescribeUserPool",
              "cognito-idp:UpdateUserPool",
              "cognito-idp:UpdateUserPoolClient",
              "dynamodb:CreateTable",
              "dynamodb:DeleteItem",
              "dynamodb:DeleteTable",
              "dynamodb:DescribeTable",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:UpdateTable",
              "iam:CreateRole",
              "iam:DeleteRole",
              "iam:DeleteRolePolicy",
              "iam:GetRole",
              "iam:GetUser",
              "iam:PassRole",
              "iam:PutRolePolicy",
              "iam:UpdateRole",
              "lambda:AddPermission",
              "lambda:CreateFunction",
              "lambda:DeleteFunction",
              "lambda:GetFunction",
              "lambda:GetFunctionConfiguration",
              "lambda:InvokeAsync",
              "lambda:InvokeFunction",
              "lambda:RemovePermission",
              "lambda:UpdateFunctionCode",
              "lambda:UpdateFunctionConfiguration",
              "s3:*",
              "amplify:*"
          ],
          "Resource": "*"
      }
  ]
}

```
IAM Policy Sources:
- IAM Policy [old docs]
- IAM Policy [new docs]



<!--LINK References -->

<!--directives-->
[directives]: https://www.apollographql.com/docs/graphql-tools/schema-directives/
[about directives]: https://graphql.org/learn/queries/#directives


[Custom AWS Directives]: https://aws-amplify.github.io/docs/cli-toolchain/graphql
[@model]: https://docs.amplify.aws/cli/graphql-transformer/directives#model
[@key]: https://docs.amplify.aws/cli/graphql-transformer/directives#key
[@auth]: https://docs.amplify.aws/cli/graphql-transformer/directives#auth
[@function]: https://docs.amplify.aws/cli/graphql-transformer/directives#function
[@connection]: https://docs.amplify.aws/cli/graphql-transformer/directives#connection
[@versioned]: https://docs.amplify.aws/cli/graphql-transformer/directives#versioned
[@searchable]: https://docs.amplify.aws/cli/graphql-transformer/directives#searchable


[Access Patterns]: https://aws-amplify.github.io/docs/cli-toolchain/graphql#data-access-patterns

<!--tutorials-->
[Robust GraphQL APIs]: https://www.youtube.com/watch?v=-cCbTcNyk-Y
[Serverless GraphQL React]: https://www.youtube.com/watch?v=HZUlQ7Z2xHQ
[talk repo]: https://github.com/dabit3/aws-appsync-react-workshop

<!--IAM-->
[old docs]: https://aws-amplify.github.io/docs/cli-toolchain/usage#iam-policy-for-the-cli
[new docs]: https://docs.amplify.aws/cli/usage/iam