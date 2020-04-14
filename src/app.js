import API, { graphqlOperation } from "@aws-amplify/api"
import PubSub from "@aws-amplify/pubsub"
import { createTodo } from "./graphql/mutations"
import { listTodos } from "./graphql/queries"
import { onCreateTodo } from "./graphql/subscriptions"

// configure library
import awsconfig from "./aws-exports"

API.configure(awsconfig)
PubSub.configure(awsconfig)

// hard coded new todo
async function createNewTodo() {
  const todo = { name: "ain't no lie", description: "bye bye bye" }
  // use the GraphQL API
  return await API.graphql(graphqlOperation(createTodo, { input: todo }))
}

// mutation display
const MutationButton = document.getElementById("MutationEventButton")
const MutationResult = document.getElementById("MutationResult")
// query display
const QueryResult = document.getElementById("QueryResult")
// subscription display
const SubscriptionResult = document.getElementById("SubscriptionResult")

async function getData() {
  QueryResult.innerHTML = `QUERY RESULTS`
  API.graphql(graphqlOperation(listTodos)).then(evt => {
    evt.data.listTodos.items.map(
      (todo, i) => (QueryResult.innerHTML += `<p>${todo.name} - ${todo.description}</p>`)
    )
  })
}

MutationButton.addEventListener("click", evt => {
  MutationResult.innerHTML = `MUTATION RESULTS:`
  createNewTodo().then(evt => {
    MutationResult.innerHTML += `<p>${evt.data.createTodo.name} - ${evt.data.createTodo.description}</p>`
    getData()
  })
})

API.graphql(graphqlOperation(onCreateTodo)).subscribe({
  next: evt => {
    SubscriptionResult.innerHTML = `SUBSCRIPTION RESULTS`
    const todo = evt.value.data.onCreateTodo
    SubscriptionResult.innerHTML += `<p>${todo.name} - ${todo.description}</p>`
  },
})
