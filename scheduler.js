import Web3 from 'web3'
import Canteen from './build/contracts/Canteen.json'
import Docker from 'dockerode'
import _ from 'lodash'

class CanteenScheduler {
  async start(provider, contractAddress, privateKey, dockerPath = '/var/run/docker.sock') {
    const web3 = new Web3(provider)
    const account = web3.eth.accounts.wallet.add(privateKey && web3.eth.accounts.privateKeyToAccount(privateKey) || web3.eth.accounts.create())

    const contract = new web3.eth.Contract(Canteen.abi, contractAddress, {from: account.address})

    const docker = new Docker({socketPath: dockerPath})

    this.docker = docker
    this.contract = contract
    this.account = account
    this.web3 = web3

    // await this.updateScheduler('rethinkdb:latest')
    // await this.updateScheduler('crccheck/hello-world')
  }

  async updateScheduler(scheduledImage) {
    this.docker.pull(scheduledImage, (err, stream) => {
      console.log("");

      this.docker.modem.followProgress(stream, finished.bind(this), progress)

      function progress(event) {
        console.log(`${event.status}${event.id && ` ID: ${event.id}` || ''}`)
      }

      async function finished() {
        console.log("");

        const containers = await this.docker.listContainers()

        console.log(`Starting up a container with the image '${scheduledImage}'.`)

        const containerStatus = _.find(containers, {Image: scheduledImage})

        const scheduleImage = async () => {
          const containers = await this.docker.listContainers()
          const containerStatus = _.find(containers, {Image: scheduledImage})

          let container
          if (!containerStatus) {
            // Create a new container if not exist.

            const port = 8000

            container = await this.docker.createContainer({
              Image: scheduledImage,
              ExposedPorts: {
                [`${port}/tcp`]: {}
              },
              HostConfig: {
                PortBindings: {
                  [`${port}/tcp`]: [{HostPort: port.toString()}]
                }
              }
            })

            console.log('Successfully created a new container and binded it to the scheduler.')
          } else {
            // Get reference to the container.

            container = this.docker.getContainer(containerStatus['Id'])
            console.log('Found a stopped container; started it and binded it to the scheduler.')
          }

          // Wipe out the old container.
          const oldContainer = this.container
          if (oldContainer) {
            console.log('Stopping and removing prior image binded to the scheduler.')
            await oldContainer.stop()
            await oldContainer.remove()
          }

          // Run the new (or paused) container.
          await container.start()

          console.log(`Node and scheduler is ready. Container ID is: ${container.id}`)

          this.container = container
        }

        if (containerStatus && containerStatus.State === 'running') {
          let container = this.docker.getContainer(containerStatus['Id'])
          await container.stop()
          await container.remove()

          console.log(`Found an existing running container; removing it...`)

          setTimeout(async () => await scheduleImage(), 3000)
        } else {
          await scheduleImage()
        }
      }
    })
  }

  async cleanup() {
    console.log('Scheduler stopping; stopping and removing binded container.')

    if (this.container) {
      await
        this.container.stop()
      await
        this.container.remove()
    }
  }
}

export default new CanteenScheduler()