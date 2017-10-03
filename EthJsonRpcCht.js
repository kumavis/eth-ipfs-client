const EthQuery = require('ethjs-query')

class EthJsonRpcCht {

  constructor ({ blockTracker, provider }) {
    this.blockTracker = blockTracker
    this.provider = provider
    this.eth = new EthQuery(provider)
  }

  async blockRefToHash(blockRef) {
    let block
    if (blockRef === 'latest') {
      block = await this.blockTracker.awaitCurrentBlock()
    } else {
      block = await this.eth.getBlockByNumber(blockRef, false)
    }
    const blockHashHex = block.hash
    const blockHash = Buffer.from(block.hash.slice(2), 'hex')
    return blockHash
  }

}

module.exports = EthJsonRpcCht