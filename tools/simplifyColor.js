import { MongoClient, GridFSBucket } from 'mongodb'

const uri = 'mongodb://localhost:27017'
const client = new MongoClient(uri)
function rgba(r, g, b, a) {
  const cbuf = Buffer.alloc(3)
  cbuf.writeUInt8(r, 0)
  cbuf.writeUInt8(g, 1)
  cbuf.writeUInt8(b, 2)
  return cbuf
}

const colorMap = {
  image: rgba(0, 0, 0, 0),
  butter: rgba(237, 212, 0, 1),
  orange: rgba(245, 121, 0, 1),
  chocolate: rgba(193, 125, 17, 1),
  chameleon: rgba(115, 210, 22, 1),
  skyblue: rgba(52, 101, 164, 1),
  plum: rgba(117, 80, 123, 1),
  scarletred: rgba(204, 0, 0, 1),
  aluminium1: rgba(211, 215, 207, 1),
  aluminium2: rgba(85, 87, 83, 1),
}

async function main() {
  await client.connect()
  const db = client.db('textopoly')
  const txt = db.collection('txt')
  const cursor = txt.find({})
  for await (const doc of cursor) {
    if (doc.c) {
      const c = colorMap[doc.c]
      if (c) {
        await txt.updateOne(
          { _id: doc._id },
          { $set: { c } },
          { upsert: false }
        )
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => client.close())
