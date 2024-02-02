import { MongoClient, GridFSBucket } from 'mongodb'
import fs from 'fs'

const uri = 'mongodb://localhost:27017'
const client = new MongoClient(uri)

async function main() {
  await client.connect()
  const db = client.db('textopoly')
  const txt = db.collection('txt')
  const cursor = txt.find({ i: { $exists: true } }, { projection: { _id: 1 } })
  const c = Buffer.alloc(4)
  c.writeUInt8(128, 0)
  c.writeUInt8(128, 1)
  c.writeUInt8(128, 2)
  c.writeUInt8(32, 3)
  for await (const doc of cursor) {
    await txt.updateOne({ _id: doc._id }, { $set: { c } }, { upsert: false })
  }
}

main()
  .catch(console.error)
  .finally(() => client.close())
