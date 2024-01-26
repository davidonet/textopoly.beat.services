import { MongoClient } from 'mongodb'

const uri = 'mongodb://localhost:27017'
const client = new MongoClient(uri)

class DataSources {
  constructor() {
    this.isInitialized = false
    this.initialisationStarted = false
    this.db = null
    this.txt = null
    this.path = null
    this.author = null
  }

  async init() {
    if (this.isInitialized) return
    if (this.initialisationStarted) {
      while (!this.isInitialized) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } else {
      this.initialisationStarted = true
      const client = new MongoClient(uri)
      await client.connect()
      this.db = client.db('textopoly')
      this.txt = this.db.collection('txt')
      this.path = this.db.collection('path')
      this.author = this.db.collection('author')
      this.isInitialized = true
    }
  }

  get txt() {
    return (async () => {
      await this.init()
      return this.txt
    })()
  }
  get path() {
    return (async () => {
      await this.init()
      return this.path
    })()
  }
  get author() {
    return (async () => {
      await this.init()
      return this.author
    })()
  }
}

export const dataSources = new DataSources()
