// see tests/datagarrison.js for a usage example
const fetch = require('isomorphic-unfetch')

const get = stream => fetchStream(stream).then(parse)

const fetchStream = ({ user, stream }) => {
  const endpoint = `https://datagarrison.com/users/${user}/${stream}/temp/${stream}_live.txt`

  return fetch(endpoint)
    .then(response => {
      const { status, ok } = response
      if (ok) {
        return {
          endpoint: endpoint,
          data: response.text()
        }
      }
      throw new Error(`Request rejected with status ${status}`)
    })
}

const parse = ({ endpoint: source, data }) => {
  const lines = data.split(`\r\n`)

  const name = lines.shift().trim()
  // todo: should we include the timezone in the dates?
  const timezone = lines.shift().split(':')[1].trim()
  const header = lines.shift().split('\t')
  header.pop() // extra '\t'

  const samples = lines.map(line => {
    return line
      .split('\t')
      .map((datum, index) => {
        if (!index) return Date.parse(datum) // first is datetime
        if (!datum) return null
        return parseFloat(datum)
      })
  })

  return { source, name, timezone, header, samples }
}

module.exports = { get, parse }
