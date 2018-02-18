module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 4600000,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/0zY4DU8r3wE3iXqvSxp1")
      },
      network_id: "*",
      gas: 4000000
    },
    rinkeby: {
      provider: function() {
        const mnemonic = "section bean bright loud summer crumble reveal result draft brush load edit"
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/0zY4DU8r3wE3iXqvSxp1")
      },
      network_id: "*",
      gas: 4000000
    },
    live: {
      network_id: 1,
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://mainnet.infura.io/0zY4DU8r3wE3iXqvSxp1")
      },
      gas: 4000000,
      gasPrice: 26000000000
    }
  }
};