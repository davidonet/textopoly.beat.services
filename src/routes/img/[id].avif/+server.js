import { dataSources } from '$lib/server/mongo.js'
import { ObjectId } from 'mongodb'

export async function GET({ params: { id }, url: { searchParams } }) {
  const txt = await dataSources.txt
  const si = searchParams.has('s')
  let projection = {
    _id: 0,
  }
  if (si) {
    projection.si = 1
  } else {
    projection.i = 1
  }

  let buf = null
  const image = await txt.findOne({ _id: new ObjectId(id) }, { projection })
  if (si) {
    buf = image.si.buffer
  } else {
    buf = image.i.buffer
  }
  return new Response(buf, {
    headers: {
      'Content-Type': 'image/avif',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
