import cluster from './cluster'
import express from 'express';
import _ from 'lodash';
import http from 'http';

class WebServer {
  start() {
    const app = express()
    const port = 3000

    const clusterDetails = (req, res) => {
      const swim = cluster.getProtocol();

      const members = [swim.whoami()].concat(_.map(swim.members(), member => member.host));
      res.status(200).json({members: members});
    }

    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    app.get('/', clusterDetails)
    app.get('/cluster', clusterDetails);

    try {
      const server = http.createServer(app);
      server.on('error', err => {
        console.error(err);
      });
      server.listen(3000);
      console.log(`Cluster health check web service is listening on port ${port}`)
    } catch (error) {
      console.log(error.message);
    }
  }
}

export default new WebServer();

