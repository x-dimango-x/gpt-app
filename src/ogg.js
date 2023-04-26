import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import instaler from '@ffmpeg-installer/ffmpeg'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { removeFile } from './utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(instaler.path)
  }

  toMp3(input, output) {
    try {
      const outputPath = resolve(__dirname, '../voices', `${output}.mp3`)
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .inputOption('-t 30')
          .output(outputPath)
          .on('end', () => {
            removeFile(input)
            resolve(outputPath)
          })
          .on('error', err => reject(err.message))
          .run()
      })
    } catch (err) {
      console.log('convert to mp3 error:', err.message);
    }
  }

  async create(url, filename) {
    try {
      const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`)
      const res = await axios({
        method: 'get',
        url,
        responseType: "stream"
      })
      return new Promise(resolve => {
        const stream = createWriteStream(oggPath)
        res.data.pipe(stream)
        stream.on('finish', () => resolve(oggPath))
      })
    } catch (err) {
      console.log('create error:', err.message);
    }
  }
}

export const ogg = new OggConverter()