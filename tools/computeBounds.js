import { MongoClient, GridFSBucket } from 'mongodb'

const uri = 'mongodb://localhost:27017'
const client = new MongoClient(uri)

async function main() {
  await client.connect()
  const db = client.db('textopoly')
  const txt = db.collection('txt')
  const cursor = txt.find({})
  let xmin = Infinity
  let xmax = -Infinity
  let ymin = Infinity
  let ymax = -Infinity
  for await (const doc of cursor) {
    const [x, y] = doc.p
    if (x < xmin) xmin = x
    if (x > xmax) xmax = x
    if (y < ymin) ymin = y
    if (y > ymax) ymax = y
  }
  console.log(xmin, xmax, ymin, ymax)
}

main()
  .catch(console.error)
  .finally(() => client.close())
