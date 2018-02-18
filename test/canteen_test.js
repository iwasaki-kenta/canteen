const utils = require('web3-utils')
const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

var Canteen = artifacts.require("Canteen");

contract('Canteen', accounts => { 
  let canteen = null
  const owner = accounts[0]
  const purchaser = accounts[1]

  beforeEach(async function() { 
    canteen = await Canteen.new({from: owner, gas: 3000000})
  })

  it('initial state', async function () { 
    const members = await canteen.getMembersCount()
    const images = await canteen.getImagesCount()

    members.should.bignumber.be.equal(0)
    images.should.bignumber.be.equal(0)
  })

  describe('Hosts and Images:', () => { 
    var details;

    it('test suite 1', async function () { 
      await canteen.addMember("host1");
      details = await canteen.getMemberDetails("host1");
      details[0].should.be.equal("");
      details[1].should.be.equal(true);

      await canteen.addImage("img1", 2);
      details = await canteen.getMemberDetails("host1");
      details[0].should.be.equal("img1");

      await canteen.addMember("host2");
      details = await canteen.getMemberDetails("host2");
      details[0].should.be.equal("img1");
      details[1].should.be.equal(true);

      await canteen.addMember("host3");
      details = await canteen.getMemberDetails("host3");
      details[0].should.be.equal("");
      details[1].should.be.equal(true);

      await canteen.removeMember("host2");
      details = await canteen.getMemberDetails("host2");
      details[0].should.be.equal("");
      details[1].should.be.equal(false);
      details = await canteen.getMemberDetails("host3");
      details[0].should.be.equal("img1");

      await canteen.addImage("img2", 2);
      const images = await canteen.getImagesCount()
      images.should.bignumber.be.equal(2);
      details = await canteen.getMemberDetails("host1");
      details[0].should.be.equal("img2");
      details = await canteen.getMemberDetails("host3");
      details[0].should.be.equal("img1");

      await canteen.removeImage("img1");
      details = await canteen.getMemberDetails("host1");
      details[0].should.be.equal("img2");
      details = await canteen.getMemberDetails("host3");
      details[0].should.be.equal("img2");
    })
  })

  describe('Adding Ports and Image Details:', () => { 
    var details;

    it('test suite 1', async function () { 
      await canteen.addImage("image1", 2);
      details = await canteen.getImageDetails("image1");
      details[0].should.bignumber.be.equal(2);
      details[1].should.bignumber.be.equal(0);
      details[2].should.be.equal(true);
      
      await canteen.addPortForImage("image1", 8080, 80);
      details = await canteen.getPortsForImage("image1");
      details[0][0].should.bignumber.be.equal(8080);
      details[0][1].should.bignumber.be.equal(80);

      await canteen.addPortForImage("image1", 5000, 50);
      details = await canteen.getPortsForImage("image1");
      details[1][0].should.bignumber.be.equal(5000);
      details[1][1].should.bignumber.be.equal(50);
    })
  })
})

