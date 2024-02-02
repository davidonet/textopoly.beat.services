import { MongoClient, GridFSBucket } from 'mongodb'
import { createWriteStream } from 'fs'

const uri = 'mongodb://localhost:27017'
const client = new MongoClient(uri)

async function main() {
  await client.connect()
  const db = client.db('textopoly')
  const txt = db.collection('txt')
  const cursor = txt.find({})

  const size = {
    s: { w: 4, h: 3 },
    l: { w: 8, h: 3 },
    t: { w: 4, h: 6 },
    f: { w: 8, h: 6 },
  }

  let svg =
    '<svg width="20000" height="20000" xmlns="http://www.w3.org/2000/svg">'
  for await (const doc of cursor) {
    let [x, y] = doc.p
    x = 4100 + 2 * x
    y = 3000 + 1.5 * y
    const { w, h } = size[doc.s]
    const fill = '#' + doc.c.toString('hex')
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" />`
  }
  svg += '</svg>'
  const stream = createWriteStream('map.svg')
  stream.write(svg)
  stream.end()
  console.log('Done')
}

main()
  .catch(console.error)
  .finally(() => client.close())
