const createEthIpfsClient = require('./index')
const IpfsClient = require('ipfs')
const EthQuery = require('ethjs-query')
const ETH_IPFS_BRIDGES = [
  // '/dns4/ipfs.lab.metamask.io/tcp/443/wss/ipfs/QmdcCVdmHsA1s69GhQZrszpnb3wmtRwv81jojAurhsH9cz',
  '/dns4/fox.musteka.la/tcp/443/wss/ipfs/Qmc7etyUd9tEa3ZBD3LCTMDL96qcMi8cKfHEiLt5nhVdVC',
  '/dns4/bat.musteka.la/tcp/443/wss/ipfs/QmPaBC5Lmfj7vctVxRPcKvfZds9Zk96dgjgthvg4Dgf7at',
  '/dns4/monkey.musteka.la/tcp/443/wss/ipfs/QmZDfxSycZxaaYyrCyHdNEiip3wmxTgriPzEYETEn9Z6K3',
  '/dns4/panda.musteka.la/tcp/443/wss/ipfs/QmUGARsthjG4EJBCrYzkuCESjn5G2akmmuawKPbZrFM3E5',
  '/dns4/tiger.musteka.la/tcp/443/wss/ipfs/QmXFdPj3FuVpkgmNHNTFitkp4DSmVuF6HxNX6tCZr4LFz9',
]

const ipfs = new IpfsClient({
  // repo: '/tmp/ipfs' + Math.random(),
  Bootstrap: ETH_IPFS_BRIDGES,
})
ipfs.on('ready', start)

const { engine, provider, blockTracker, cht } = createEthIpfsClient({ ipfs })
const eth = new EthQuery(provider)

// start()

async function start() {
  console.log('ipfs ready!')
  // connect to eth-ipfs bridge nodes
  ETH_IPFS_BRIDGES.map((address) => ipfs.swarm.connect(address))

  // console.log('latest', await cht.blockRefToHash('latest'))
  // console.log('0x3d0000', await cht.blockRefToHash('0x3d0000'))
  const balanceBN = await eth.getBalance('0x70AD465E0BAB6504002ad58C744eD89C7DA38524')
  const ethFloat = parseFloat(balanceBN.toString(), 10)/1e18
  console.log(ethFloat.toFixed(2), 'eth')
}