import cluster from './cluster'
import express from 'express';
import _ from 'lodash';

class WebServer {
  start() {
    const app = express()
    const port = 3000

    const clusterDetails = (req, res) => {
      const swim = cluster.getProtocol();

      const members = [swim.whoami()] + _.map(swim.members(), member => member.host);
      res.status(200).send(members);
    }

    app.get('/', clusterDetails)
    app.get('/cluster', clusterDetails);

    app.listen(port, err => {
      if (err) {
        return console.log('something bad happened', err)
      }

      console.log(`Cluster health check web service is listening on port ${port}`)
    })
  }
}

export default new WebServer();

