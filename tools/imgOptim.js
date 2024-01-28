import { MongoClient, GridFSBucket } from 'mongodb'
import sharp from 'sharp'

const uri =
  'mongodb+srv://textopoly:vnl66g7a4vAGZ7XN@textopoly.aiz393w.mongodb.net/'
const client = new MongoClient(uri)

async function main() {
  await client.connect()
  const db = client.db('textopoly')
  const txt = db.collection('txt')
  const path = db.collection('path')
  const author = db.collection('author')
  const gridFS = new GridFSBucket(db)
  const cursor = gridFS.find({})
  for await (const doc of cursor) {
    if (doc.filename.charAt(0) !== 's') {
      console.log(doc.filename)
      try {
        const buffer = await gridFS
          .openDownloadStream(doc._id)
          .pipe(sharp().avif({ quality: 50 }))
          .toBuffer()
        await txt.updateOne(
          { p: [parseInt(doc.metadata.x), parseInt(doc.metadata.y)] },
          { $set: { i: buffer } },
          { upsert: false }
        )
        console.log(doc.length, '=>', buffer.length)
      } catch (e) {
        console.log(e)
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => client.close())
