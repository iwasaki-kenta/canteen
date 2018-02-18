import Swim from 'swim'
import _ from 'lodash'

class CanteenCluster {
  start(port, nodes) {
    const swim = new Swim({local: {host: `127.0.0.1:${port}`}})

    console.log(`Joining ${nodes.length} specified bootstrap node(s).`)

    swim.bootstrap(nodes, err => {
      if (err) {
        console.error(err)
        return
      }

      console.log(`Cluster members: ${swim.members().length && ('[' + _.map(swim.members(), member => member.host).join(', ') + ']') || 'None.'}`)

      swim.on(Swim.EventType.Change, update => {
        console.log(`Cluster members: ${swim.members().length && ('[' + _.map(swim.members(), member => member.host).join(', ') + ']') || 'None.'}`)
      })
    })

    this.swim = swim
  }
}

export default new CanteenCluster()