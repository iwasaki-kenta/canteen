import React, { Component, ReactDOM } from 'react'
import './App.css'
import Web3 from 'web3'
import styled from 'styled-components'
import * as d3 from 'd3'
import Canteen from './Canteen.json'
import _ from 'lodash'

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
flex-direction: row;
margin-top: 0.5em;
margin-bottom: 0.5em;
padding-top: 1em;
padding-bottom: 1em;
padding-left: 0.5em;
background-color: #e6e6e6;
font-size: 0.8em;
color: black;

& > *:not(:last-child) {
margin-right: 0.5em;
}
`

const StatusColumn = styled.div`
flex: 1;
width: inherit;
height: 100%;
`

const FormColumn = styled.div`
flex: 2;
width: 100%;
height: 100%;
text-align: right;
& > *{
margin-right: 1em;
}
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

const Label = styled.b`
font-weight: 600;
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

    this.state = {
      status: 'connecting...',
      contract: '0x345ca3e014aaf5dca488057592ee47305d9b3e10',
      images: [],
      nodes: [],
      image: {
        add: {
          imageName: '',
          num: ''
        },
        remove: {
          imageName: ''
        }
      }
    }

    this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    this.contract = new this.web3.eth.Contract(Canteen.abi, this.state.contract)

    this.width = 960
    this.height = 500
    this.force = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(-700).distanceMin(100).distanceMax(1000))
      .force('link', d3.forceLink().id(d => d.index))
      .force('collide', d3.forceCollide(d => d.r + 8).iterations(16))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('y', d3.forceY(0.001))
      .force('x', d3.forceX(0.001))
  }

  async componentDidMount() {
    // Get cluster data and setup visualization.

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

      nodes.push({host: node, r: 80, ...data})
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
      .attr('text-anchor', 'middle')
      .attr('dy', 0)
      .style('font-family', 'ProximaNova')
      .style('font-size', '1.25em')
      .style('font-weight', 600)
      .style('fill', 'white')
      .text(d => d.host)

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 16)
      .style('font-family', 'ProximaNova')
      .style('font-size', '0.8em')
      .style('font-weight', 600)
      .style('fill', '#e1e1e1')
      .text(d => d.image)

    this.force.on('tick', () => this.graph.call(this.updateGraph.bind(this)))

    // Get images.
    const deployedImages = []

    const imageCount = await this.contract.methods.getImagesCount().call()
    for (let i = 0; i < imageCount; i++) {
      const imageName = await this.contract.methods.images(i).call()
      const imageDetails = await this.contract.methods.getImageDetails(imageName).call()

      // Check if image is active.
      if (imageDetails['2'] && !_.find(deployedImages, name => name === imageName)) {
        deployedImages.push(imageName)
      }
    }

    this.setState({images: deployedImages, nodes})
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

  async addImage() {
    const imageName = this.state.image.add.imageName
    const reps = parseInt(this.state.image.add.num)

    const account = (await this.web3.eth.getAccounts())[0]
    await this.contract.methods.addImage(imageName, reps).send({from: account, gas: 5000000})
  }

  async removeImage() {
    const imageName = this.state.image.remove.imageName

    const account = (await this.web3.eth.getAccounts())[0]
    await this.contract.methods.removeImage(imageName).send({from: account, gas: 5000000})
  }

  render() {
    const {status, images, contract, nodes} = this.state

    return (
      <Page>
        <Container>
          <Title>canteen.</Title>
          <Subtitle>A decentralized container orchestrator.</Subtitle>

          <StatusContainer>
            <StatusColumn style={{flex: 2}}><Label>contract:</Label> <code>{contract}</code></StatusColumn>
            <StatusColumn style={{flex: 2}}><Label>deployed:</Label> {images.length == 0 && 'N/A' || images.join(', ')}
            </StatusColumn>
            <StatusColumn><Label>num servers:</Label> {nodes.length}</StatusColumn>
          </StatusContainer>

          <Graph>
            <g ref='graph'></g>
          </Graph>
          <div>
            <StatusContainer>
              <StatusColumn><Label>Add Image</Label></StatusColumn>
              <FormColumn>
                <input type='text' placeholder={'Image name'} onChange={event => {
                  this.setState({image: {add: {...this.state.image.add, imageName: event.target.value}}})
                }}/>
                <input type='text' placeholder={'# of replicas'} onChange={event => {
                  this.setState({image: {add: {...this.state.image.add, num: event.target.value}}})
                }}/>
                <button onClick={this.addImage.bind(this)}> Add image</button>
              </FormColumn>
            </StatusContainer>
            <StatusContainer>
              <StatusColumn><Label>Remove Image</Label></StatusColumn>
              <FormColumn>
                <input type='text' placeholder={'Image name'} onChange={event => {
                  this.setState({image: {remove: {imageName: event.target.value}}})
                }}/>

                <button onClick={this.removeImage.bind(this)}> Remove image</button>
              </FormColumn>
            </StatusContainer>
          </div>
        </Container>
      </Page>
    )
  }
}

export default App
