const createEthBaseClient = require('eth-rpc-client/createEthBaseClient')
const JsonRpcEngine = require('json-rpc-engine')
const asMiddleware = require('json-rpc-engine/src/asMiddleware')
const createFetchMiddleware = require('eth-json-rpc-middleware/fetch')
const createScaffoldMiddleware = require('eth-json-rpc-middleware/scaffold')
const createFilterMiddleware = require('eth-json-rpc-filters')
const createStatsMiddleware = require('eth-json-rpc-middleware/stats')
const createVmMiddleware = require('eth-json-rpc-middleware/vm')
const providerFromEngine = require('eth-json-rpc-middleware/providerFromEngine')
const BlockTracker = require('eth-block-tracker')
const createIpfsMiddleware = require('eth-json-rpc-ipfs')
const EthJsonRpcCht = require('./EthJsonRpcCht')

module.exports = createEthIpfsClient


function createEthIpfsClient(_opts) {
  // parse options
  const opts = Object.assign({}, {
    rpcUrl: 'https://mainnet.infura.io',
  }, _opts)

  // setup data source
  const { rpcUrl } = opts
  const internalEngine = new JsonRpcEngine()
  const fetchMiddleware = createFetchMiddleware({ rpcUrl })
  internalEngine.push(fetchMiddleware)

  // setup blockTracker
  const internalProvider = providerFromEngine(internalEngine)
  const blockTracker = new BlockTracker({ provider: internalProvider })
  blockTracker.start()

  // setup cht and ipfs
  const cht = new EthJsonRpcCht({ blockTracker, provider: internalProvider })
  const { ipfs } = opts
  const ipfsMiddleware = createIpfsMiddleware({ ipfs, cht })

  // setup network middleware
  const networkEngine = new JsonRpcEngine()
  networkEngine.push(ipfsMiddleware)
  networkEngine.push(asMiddleware(internalEngine))
  const networkMiddleware = asMiddleware(networkEngine)

  const { engine, provider } = createEthBaseClient(Object.assign({
    blockTracker,
    networkMiddleware,
    createPolyfillMiddleware,
  }, opts))

  return { engine, provider, blockTracker, cht }
}

function createPolyfillMiddleware({ opts, provider, blockTracker }) {
  const internalEngine = new JsonRpcEngine()
  internalEngine.push(createScaffoldMiddleware(opts.scaffold))
  internalEngine.push(createVmMiddleware({ provider }))
  internalEngine.push(createFilterMiddleware({ blockTracker, provider }))
  return asMiddleware(internalEngine)
}