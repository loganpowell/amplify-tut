import { listTalks } from "./graphql/queries"
import { createTalk } from "./graphql/mutations"
import { onCreateTalk } from "./graphql/subscriptions"

import Amplify, { API, graphqlOperation } from "@aws-amplify/api"
import uuid from "uuid/v4"

import awsmobile from "./aws-exports"

Amplify.configure(awsmobile)

import regeneratorRuntime from "regenerator-runtime"

const log = console.log

const root = document.getElementById("app")

// import query definition
const getData = async () => {
  const talkData = await API.graphql(graphqlOperation(listTalks))
  //log("talkData:", talkData)
  // @ts-ignore
  const items = talkData.data.listTalks.items
  const node = document.createElement("div")
  items.forEach((talk, index) => {
    const inner = document.createElement("div")
    const me = `<h2>${talk.speakerName}</h3>
      <h3>${talk.name}</h5>
      <h5>${talk.speakerBio}</h5>
      <p>${talk.description}</p>`
    inner.innerHTML = me

    node.appendChild(inner)
  })
  //console.log("inject:", node)
  root.appendChild(node)
}

getData()

API.graphql(graphqlOperation(onCreateTalk)).subscribe({
  next: e => (console.log("emission:", e), getData()),
})

const fields = ``
