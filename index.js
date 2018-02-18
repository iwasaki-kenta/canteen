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

cluster.start(port, nodes)

scheduler.start(new Web3.providers.HttpProvider('http://localhost:8545'),
  '0x30753e4a8aad7f8597332e813735def5dd395028',
  '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3')

process.stdin.resume();

process.on('exit', scheduler.cleanup.bind(scheduler));
process.on('SIGINT', scheduler.cleanup.bind(scheduler));