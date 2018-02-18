import cluster from './cluster'

const express = require('express')
const app = express()
const port = 3000

app.get('/', (request, response) => {
  response.send(clusterDetails);
})

app.get('/cluster', function(req, res) {
	var swim = cluster.getProtocol()
	var clusterDetails = _.map(swim.members(), member => member.host);
    res.send(200, clusterDetails);
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})

