import { dataSources } from '$lib/server/mongo.js'

export async function load({ url: { searchParams } }) {
  const txt = await dataSources.txt
  const x = searchParams.get('x') || 0
  const y = searchParams.get('y') || 0
  const z = searchParams.get('z') || 10
  const coordinates = [x, y].map(parseFloat)
  const txts = await txt
    .find(
      {
        p: {
          $near: coordinates,
          $maxDistance: 5 + 4 * z,
        },
      },
      {
        projection: {
          _id: 1,
          p: 1,
          t: 1,
          a: 1,
          c: 1,
          s: 1,
        },
      }
    )
    .toArray()
  for (const t of txts) {
    t.c = '#' + t.c.toString('hex')
    t.id = t._id.toString()
    delete t._id
  }
  return {
    txts,
  }
}
