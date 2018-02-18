import React, { Component } from 'react'
import './App.css'
import Web3 from 'web3'
import styled from 'styled-components'

const Page = styled.div`
background-color: black;
width: 100%;
height: 100%;
`

class App extends Component {
  constructor(props) {
    super(props)

    this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

    this.state = {}
  }

  async componentDidMount() {
    const data = await (await fetch('http://localhost:3000/cluster')).json();
    console.log(data);
  }

  render() {
    return (
      <Page>

      </Page>
    )
  }
}

export default App
