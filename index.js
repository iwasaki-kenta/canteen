import _ from 'lodash'
import cluster from './cluster'
import scheduler from './scheduler'
import Web3 from 'web3'

const args = _.reduce(process.argv.slice(2), (args, arg) => {
  const [k, v = true] = arg.split('=')
  args[k] = v
  return args
}, {})

const port = args.port || 5000
const nodes = args.nodes && args.nodes.split(',') || []

scheduler.start(new Web3.providers.HttpProvider('http://localhost:7545'),
  '0xf25186B5081Ff5cE73482AD761DB0eB0d25abfBF',
  '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3')

cluster.start(port, nodes)

process.stdin.resume();

process.on('exit', scheduler.cleanup.bind(scheduler));
process.on('SIGINT', scheduler.cleanup.bind(scheduler));