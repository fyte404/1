import db from '../../lib/database.js'
import { plugins } from '../../lib/plugins.js'
import { readMore, ranNumb, padLead, runtimes } from '../../lib/func.js'
import { xpRange } from '../../lib/levelling.js'
import { getDevice } from '@whiskeysockets/baileys'
import { promises } from 'fs'
import { join } from 'path'
import os from 'os'

let tags = {
	'submenu': 'Sub menu',
        'tools': 'Tools',
	'entertainment': 'Entertainment'
}
const defaultMenu = {
	before: `
Welcome to NinoBot

- Name  : %name
- Rank : *%role*
`.trimStart(),
	header: '-# *%category',
	body: '• %cmd',
	footer: '',
}
let handler = async (m, { conn, usedPrefix: _p, __dirname, command, isPrems }) => {
	try {
		let meh = padLead(ranNumb(43), 3)
		let nais = `https://i.ibb.co/0CKcS2N/73bfd724f257bb0b14707b7249c7b337.jpg`
		let _package = JSON.parse(await promises.readFile(join(__dirname, '../package.json')).catch(_ => ({}))) || {}
		let { limit, role, level, exp, maxexp, money, totalexp } = db.data.users[m.sender]
		let { min, xp, max } = xpRange(level, global.multiplier)
		let name = await conn.getName(m.sender).replaceAll('\n','')
		let uptime = runtimes(process.uptime())
		let osuptime = runtimes(os.uptime())
		let help = Object.values(plugins).filter(plugin => !plugin.disabled).map(plugin => {
			return {
				help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
				tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
				prefix: 'customPrefix' in plugin,
				limit: plugin.limit,
				premium: plugin.premium,
				enabled: !plugin.disabled,
			}
		})
		for (let plugin of help)
			if (plugin && 'tags' in plugin)
				for (let tag of plugin.tags)
					if (!(tag in tags) && tag) tags[tag] = tag
		conn.menu = conn.menu ? conn.menu : {}
		let before = conn.menu.before || defaultMenu.before
		let header = conn.menu.header || defaultMenu.header
		let body = conn.menu.body || defaultMenu.body
		let footer = conn.menu.footer || defaultMenu.footer
		let _text = [
			before.replace(': *%limit', `${isPrems ? ': *Infinity' : ': *%limit'}`),
			...Object.keys(tags).map(tag => {
				return header.replace(/%category/g, tags[tag]) + '\n' + [
					...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
						return menu.help.map(help => {
							return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
								.replace(/%islimit/g, menu.limit ? '(Limit)' : '')
								.replace(/%isPremium/g, menu.premium ? '(Premium)' : '')
								.trim()
						}).join('\n')
					}),
					footer
				].join('\n')
			}),
		].join('\n')
		let text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : ''
		let replace = {
			'%': '%',
			p: _p, uptime, osuptime,
			me: conn.getName(conn.user.jid),
			github: _package.homepage ? _package.homepage.url || _package.homepage : '[unknown github url]',
			limit, name, role,
			readmore: readMore
		}
		text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])
		//list button not shown on ios
		if (!/all/.test(command) && await getDevice(m.key.id) == 'android') {
			const txtList = `Welcome to RPGbot\n⦿ Current Role : *${role}*\n\nHost CPU: Intel Core i9-14900K\nRAM: 32GB\nGPU: RTX 3080\n`
			const sections = [
				[
					'SUB MENU', [
						['A.I', '.mai', '● AI and problem-solving'],
						['ALL MENU', '.allmenu', '● Menampilkan Semua Menu'],
						['OWNER', '.mowner', '◉ Owner, ROwner, Mods Privilages'],
						['ANIME', '.manime', '◉ Cari Manga, Anime, Random Pic'],
						['DOWNLOAD', '.mdownload', '◎ Youtube, Facebook, Tiktok, Dll...'],
						['GAMES & FUN', '.mfun', '⊛ RPG, Kuis, Anonymous'],
						['GENSHIN IMPACT', '.mgenshin', '⊜ genshin.dev API'],
				], 'Special Feature']
			]
			await conn.sendList(m.chat, 'Hello '+name, txtList, pauthor, 'Welcome!', nais, sections, m)
			//await conn.sendList(m.chat, 'Hello '+name, txtList, pauthor, 'LIST MENU', nais, sections, m, [['neko', '.neko', 'quick_reply'], ['copy ini', 'https://cerdas.com', 'cta_copy'], ['owner', 'https://wa.me/6282337245566', 'cta_url']])
		} else await conn.sendFThumb(m.chat, db.data.datas.maingroupname, text.trim(), nais, db.data.datas.linkgc, m)
		await conn.sendFThumb(m.chat, db.data.datas.maingroupname, text.trim(), nais, db.data.datas.linkgc, m)
	} catch (e) {
		console.log(e)
	}
}

handler.command = /^((all)?m(enu)?|help|\?)$/i

handler.exp = 3

export default handler
