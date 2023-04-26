import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'

import { config } from 'dotenv'
import { ogg } from './ogg.js'
import { openAi } from './openai.js'

const INITIAL_SESSION = {
  messages: []
}

config()
const bot = new Telegraf(process.env.TG_KEY)
bot.use(session())

const addMessages = (ctx, text) => {
  ctx.session.messages.push({ role: openAi.roles.USER, content: text })
}

bot.command('start', async ctx => {
  ctx.session = INITIAL_SESSION
  await ctx.reply('Начата новая ссесия')
})

bot.on(message('text'), async ctx => {
  ctx.session ??= INITIAL_SESSION
  try {
    await ctx.reply(code(`Ожидаю ответ от GPT...`))
    addMessages(ctx, ctx.message.text)
    const res = await openAi.chat(ctx.session.messages)
    await ctx.reply(res.content || 'Не удалось обработать запрос')
  } catch (err) {
    console.log('text handle error:', err);
  }
})

bot.on(message('voice'), async ctx => {
  ctx.session ??= INITIAL_SESSION
  try {
    await ctx.reply(code('Идёт обработка...'))
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = String(ctx.message.from.id)

    const oggPath = await ogg.create(link.href, userId)
    const mp3Path = await ogg.toMp3(oggPath, userId)

    const text = await openAi.transcription(mp3Path)
    await ctx.reply(code(`Ваш запрос: ${text}`))
    await ctx.reply(code(`Ожидаю ответ от GPT...`))
    addMessages(ctx, text)
    const res = await openAi.chat(ctx.session.messages)

    ctx.session.messages.push({ role: openAi.roles.ASSISTANT, content: res.content })

    await ctx.reply(res.content || 'Не удалось обработать запрос')
  } catch (err) {
    console.log('voice handle error:', err);
  }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))