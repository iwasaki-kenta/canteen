import Web3 from 'web3'
import Canteen from './build/contracts/Canteen.json'

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'))
const account = web3.eth.accounts.wallet.add('0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3')

const contract = new web3.eth.Contract(Canteen.abi)

const transaction = contract.deploy({data: Canteen.unlinked_binary});

web3.eth.estimateGas({data: Canteen.unlinked_binary})
  .then(estimatedGas => {
      console.log(`Estimated Gas Required: ${estimatedGas}`)

      transaction
        .send({
          from: account.address,
          gas: estimatedGas
        })
        .on('transactionHash', hash => console.log(`Transaction Hash: ${hash}`))
        .on('receipt', receipt => console.log(`Contract Address: ${receipt.contractAddress}`))
    }
  )

