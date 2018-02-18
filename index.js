import _ from 'lodash'
import cluster from './cluster'
import scheduler from './scheduler'
import Web3 from 'web3'
import web from './web-server';

const args = _.reduce(process.argv.slice(2), (args, arg) => {
  const [k, v = true] = arg.split('=')
  args[k] = v
  return args
}, {})

const port = args.port || 5000
const nodes = args.nodes && args.nodes.split(',') || []

cluster.start(port, nodes)

scheduler.start(new Web3.providers.HttpProvider('http://localhost:8545'),
  '0x2e7dfd22586b8b48525d534f8c4b5fa97c5e8247',
  '0xd2156d5db006d4f1ff254c1401aa2b10422d56e19388b0ad4b84fa62f10dd82b')

web.start();

process.stdin.resume();

process.on('exit', scheduler.cleanup.bind(scheduler));
process.on('SIGINT', scheduler.cleanup.bind(scheduler));