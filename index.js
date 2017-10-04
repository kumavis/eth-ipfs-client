const JsonRpcEngine = require('json-rpc-engine')
const asMiddleware = require('json-rpc-engine/src/asMiddleware')
const createFetchMiddleware = require('eth-json-rpc-middleware/fetch')
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

  // setup infura data source
  const { rpcUrl } = opts
  const internalEngine = new JsonRpcEngine()
  const infuraMiddleware = createFetchMiddleware({ rpcUrl })
  internalEngine.push(infuraMiddleware)

  // setup blockTracker and CHT
  const { ipfs } = opts
  const internalProvider = providerFromEngine(internalEngine)
  const blockTracker = new BlockTracker({ provider: internalProvider })
  blockTracker.start()
  const cht = new EthJsonRpcCht({ blockTracker, provider: internalProvider })
  const ipfsMiddleware = createIpfsMiddleware({ ipfs, cht })

  // stats
  const statsMiddleware = createStatsMiddleware()
  const reqTracker = createReqTracker()

  // setup external rpc engine stack
  const engine = new JsonRpcEngine()
  const provider = providerFromEngine(engine)
  // client handled
  engine.push(statsMiddleware)
  // engine.push(staticMiddleware)
  // engine.push(inflightCacheMiddleware)
  // engine.push(blockCacheMiddleware)
  // engine.push(filterMiddleware)
  // engine.push(idMgmtMiddleware)
  engine.push(createVmMiddleware({ provider }))
  // network handled
  engine.push(ipfsMiddleware)
  engine.push(reqTracker.middleware)
  engine.push(asMiddleware(internalEngine))

  return { engine, provider, blockTracker, cht, reqTracker }
}

function createReqTracker() {
  const requests = []
  const middleware = (req, res, next, end) => {
    const context = { req, res }
    requests.push(context)
    next()
  }
  return { requests, middleware }
}