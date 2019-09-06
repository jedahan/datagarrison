// see tests/datagarrison.js for a usage example
const fetch = require('isomorphic-unfetch')

const get = stream => fetchStream(stream).then(parse)

const fetchStream = ({ user, stream }) => {
  const endpoint = `https://datagarrison.com/users/${user}/${stream}/temp/${stream}_live.txt`

  return fetch(endpoint)
    .then(async response => {
      const { status, ok } = response
      if (ok) {
        return {
          endpoint: endpoint,
          data: await response.text()
        }
      }
      throw new Error(`Request rejected with status ${status}`)
    })
}

const parse = ({ endpoint: source, data }) => {
  const lines = data.split('\r\n')

  const name = lines.shift().trim()

  const timezone = lines.shift().split(':')[1].trim()
  const direction = timezone.includes('-') ? '-' : '+'
  const minutes = parseInt(timezone.includes('minutes') ? timezone.match(/\d+/)[0] : '0')
  const hours = parseInt(minutes / 60)

  const header = lines.shift().split('\t')
  header.pop() // extra '\t'

  const samples = lines.map(line => {
    return line
      .split('\t')
      .map((datum, index) => {
        if (!index) return Date.parse(`${datum} UTC${direction}${hours}`) // first is datetime
        if (!datum) return null
        return parseFloat(datum)
      })
  })

  return { source, name, timezone, header, samples }
}

module.exports = { get, parse }
