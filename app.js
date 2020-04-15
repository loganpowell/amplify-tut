import { listTalks as ListTalks } from "./src/graphql/queries"
import Amplify, { API, graphqlOperation } from "@aws-amplify/api"
import awsmobile from "./src/aws-exports"

Amplify.configure(awsmobile)

import regeneratorRuntime from "regenerator-runtime"

const log = console.log

// import query definition
const getData = async () => {
  const talkData = await API.graphql(graphqlOperation(ListTalks))
  log("talkData:", talkData)
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
  console.log("inject:", node)
  document.getElementById("app").appendChild(node)
}

getData()
