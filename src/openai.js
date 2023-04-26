import { Configuration, OpenAIApi } from "openai"
import { createReadStream } from 'fs'
import { config } from 'dotenv';
import { removeFile } from './utils.js'

class OpenAI {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system'
  }
  constructor() {
    config()
    const configuration = new Configuration({
      organization: process.env.OG_ID,
      apiKey: process.env.AI_KEY
    })
    this.openai = new OpenAIApi(configuration)
  }

  async chat(messages) {
    try {
      const res = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
      })
      return res.data.choices[0].message
    } catch (e) {
      console.log('gpt error', e.message);
    }
  }

  async transcription(filePath) {
    try {
      const res = await this.openai.createTranscription(createReadStream(filePath), 'whisper-1')
      await removeFile(filePath)
      return res.data.text
    } catch (e) {
      console.log('transcription error', e.message);
    }
  }
}

export const openAi = new OpenAI()