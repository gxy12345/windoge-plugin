// 适配V3 Yunzai，将index.js移至app/index.js
import {
	currentVersion,
	isV3
} from './components/Changelog.js'
import Data from './components/Data.js'

if (!global.segment) {
  global.segment = (await import("oicq")).segment
}

export * from './apps/index.js'
let index = {
	windoge: {}
}
if (isV3) {
	index = await Data.importModule('/plugins/windoge-plugin/adapter', 'index.js')
}
export const windoge = index.windoge || {}
if (Bot?.logger?.info) {
	Bot.logger.info(`---------^_^---------`)
	Bot.logger.info(`windoge-plugin${currentVersion}初始化~`)
  } else {
	console.log(`windoge-plugin${currentVersion}初始化~`)
  }
  

setTimeout(async function() {
	let msgStr = await redis.get('windoge:restart-msg')
	let relpyPrivate = async function() {}
	if (!isV3) {
		let common = await Data.importModule('/lib', 'common.js')
		if (common && common.default && common.default.relpyPrivate) {
			relpyPrivate = common.default.relpyPrivate
		}
	}
	if (msgStr) {
		let msg = JSON.parse(msgStr)
		await relpyPrivate(msg.qq, msg.msg)
		await redis.del('windoge:restart-msg')
		let msgs = [`当前windoge-plugin版本: ${currentVersion}`]
		await relpyPrivate(msg.qq, msgs.join('\n'))
	}
}, 1000)