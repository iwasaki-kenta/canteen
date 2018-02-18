import React, { ReactDOM, Component } from 'react'
import './App.css'
import Web3 from 'web3'
import styled from 'styled-components'
import * as d3 from 'd3'
import _ from 'lodash'
import Canteen from './Canteen.json'

const Page = styled.div`
background-color: white;
width: 100%;
height: 100%;
margin: 4em;
line-height: 0.25em;
`

const Container = styled.div`
margin: auto;
position: relative;
width: 960px;`

const Title = styled.h1`
font-weight: 700;
font-size: 3em;
`

const StatusContainer = styled.div`
display: flex;
margin-top: 0.5em;
margin-bottom: 0.5em;
padding: 1em;
background-color: #e6e6e6;
`

const Subtitle = styled.h3`
font-weight: 300;
`

const Graph = styled.svg`
margin-top: 1em;
border: 1px solid black;
width: 960px;
height: 500px;
`

class App extends Component {
  dragstarted(d) {
    if (!d3.event.active)
      this.force.alphaTarget(0.5).restart()
    d.fx = d.x
    d.fy = d.y
  }

  dragged(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
  }

  dragended(d) {
    if (!d3.event.active)
      this.force.alphaTarget(0.5)
    d.fx = null
    d.fy = null
  }

  constructor(props) {
    super(props)

    this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    this.contract = new this.web3.eth.Contract(Canteen.abi, '0x2e7dfd22586b8b48525d534f8c4b5fa97c5e8247')

    this.width = 960
    this.height = 500
    this.force = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(-700).distanceMin(100).distanceMax(1000))
      .force('link', d3.forceLink().id(d => d.index))
      .force('collide', d3.forceCollide(d => d.r + 8).iterations(16))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('y', d3.forceY(0.001))
      .force('x', d3.forceX(0.001))

    this.state = {
      status: 'connecting...'
    }
  }

  async componentDidMount() {
    const data = await (await fetch('http://localhost:3000/cluster')).json()

    this.graph = d3.select(this.refs.graph)

    const nodes = []

    for (const node of data.members) {
      let data = {image: 'N/A', active: 'Down'}

      try {
        const details = await this.contract.methods.getMemberDetails(node).call()
        if (details) {
          data.image = details['0']
          data.active = details['1'] ? 'Up' : 'Down'
        }
      } catch (err) {
        console.log(err)
      }

      nodes.push({host: node, r: 60, ...data})
    }

    const links = []

    for (let x = 0; x < nodes.length; x++) {
      for (let y = 0; y < nodes.length; y++) {
        if (x === y) continue
        links.push({source: x, target: y})
      }
    }

    this.force.nodes(nodes).force('link').links(links)

    const link = this.graph.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#7d7d7d')

    const node = this.graph.selectAll('.node')
      .data(nodes).enter().append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', this.dragstarted.bind(this))
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragended.bind(this)))

    node.append('circle')
      .attr('r', d => d.r)
      .attr('fill', 'black')

    node.append('text')
      .attr('dx', -50)
      .attr('dy', 8)
      .style('font-family', 'ProximaNova')
      .style('font-size', '1em')
      .style('font-weight', 600)
      .style('fill', 'white')
      .text(d => d.host)

    node.append('text')
      .attr('dx', -45)
      .attr('dy', 22)
      .style('font-family', 'ProximaNova')
      .style('font-size', '0.8em')
      .style('font-weight', 600)
      .style('fill', '#e1e1e1')
      .text(d => d.image)

    this.force.on('tick', () => this.graph.call(this.updateGraph.bind(this)))
  }

  updateNode(selection) {
    selection.attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')')
  }

  updateLink(selection) {
    selection.attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
  }

  updateGraph(selection) {
    selection.selectAll('.node')
      .call(this.updateNode.bind(this))
    selection.selectAll('.link')
      .call(this.updateLink.bind(this))
  }

  render() {
    const {status} = this.state

    return (
      <Page>
        <Container>
          <Title>canteen.</Title>
          <Subtitle>A decentralized container orchestrator.</Subtitle>

          <StatusContainer>
            Test
          </StatusContainer>

          <Graph>
            <g ref='graph'></g>
          </Graph>
        </Container>
      </Page>
    )
  }
}

export default App
