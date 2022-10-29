import plugin from '../../../lib/plugins/plugin.js'
import * as Windoge from '../apps/index.js'
import { render } from './render.js'
import { checkAuth, getMysApi } from './mys.js'

export class windoge extends plugin {
  constructor () {
	let rule = {
	  reg: '.+',
	  fnc: 'dispatch'
	}
    super({
      name: 'windoge-plugin',
      desc: 'windoge插件',
      event: 'message',
      priority: 50,
      rule: [rule]
    })
	Object.defineProperty(rule, 'log', {
	  get: () => !!this.isDispatch
	})
  }
  accept () {
    this.e.original_msg = this.e.original_msg || this.e.msg
  }
  async dispatch (e) {
    let msg = e.original_msg || ''
    if (!msg) {
      return false
    }
    e.checkAuth = async function (cfg) {
      return await checkAuth(e, cfg)
    }
    e.getMysApi = async function (cfg) {
      return await getMysApi(e, cfg)
    }
    msg = '#' + msg.replace(/#|＃/, '').trim()
    for (let fn in Windoge.rule) {
      let cfg = Windoge.rule[fn]
      if (Windoge[fn] && new RegExp(cfg.reg).test(msg)) {
        let ret = await Windoge[fn](e, {
          render
        })
        if (ret === true) {
          return true
        }
      }
    }

    return false
  }
}
