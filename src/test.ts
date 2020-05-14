
import { Zilswap } from './index'
import { Network } from './constants'

const test = async () => {
  const key: string = process.env.PRIVATE_KEY || ''
  const zilswap = new Zilswap(Network.TestNet, key)
  await zilswap.initialize()
  console.log(JSON.stringify(zilswap.getAppState(), null, 4))
  await zilswap.addLiquidity('ITN', '1', '1')
  await zilswap.teardown()
}

(async () => {
  console.log('test starting..')
  await test()
  console.log('test done!')
})()