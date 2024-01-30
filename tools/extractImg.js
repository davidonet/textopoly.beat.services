import { MongoClient, GridFSBucket } from 'mongodb'
import fs from 'fs'

const uri = 'mongodb://localhost:27017'
const client = new MongoClient(uri)

async function main() {
  await client.connect()
  const db = client.db('textopoly')
  const txt = db.collection('txt')
  const cursor = txt.find({ i: { $exists: true } }, { projection: { si: 1 } })
  for await (const doc of cursor) {
    const filename = '/Users/dolivari/tmp/img/s/' + doc._id.toString() + '.avif'
    if (!doc.si?.buffer) continue
    const buffer = doc.si.buffer
    fs.writeFileSync(filename, buffer)
    console.log(filename)
  }
}

main()
  .catch(console.error)
  .finally(() => client.close())
