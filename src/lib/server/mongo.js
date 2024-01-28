import { MongoClient } from 'mongodb'
import { env } from '$env/dynamic/private'

class DataSources {
  constructor() {
    this.isInitialized = false
    this.initialisationStarted = false
    this.db = null
    this._txt = null
    this._path = null
    this._author = null
  }

  async init() {
    if (this.isInitialized) return
    if (this.initialisationStarted) {
      while (!this.isInitialized) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } else {
      this.initialisationStarted = true
      const client = new MongoClient(env.MONGOURI)
      await client.connect()
      this.db = client.db('textopoly')
      this._txt = this.db.collection('txt')
      this._path = this.db.collection('path')
      this._author = this.db.collection('author')
      this.isInitialized = true
    }
  }

  get txt() {
    return (async () => {
      await this.init()
      return this._txt
    })()
  }
  get path() {
    return (async () => {
      await this.init()
      return this._path
    })()
  }
  get author() {
    return (async () => {
      await this.init()
      return this._author
    })()
  }
}

export const dataSources = new DataSources()
