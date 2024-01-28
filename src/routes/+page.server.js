import { dataSources } from '$lib/server/mongo.js'

export async function load({ url }) {
  const txt = await dataSources.txt
  const coordinates = [0, 0]
  const txts = await txt
    .find(
      {
        p: {
          $near: coordinates,
          $maxDistance: 100,
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
  console.log(txts.length)
  for (const t of txts) {
    t.c = '#' + t.c.toString('hex')
    t.id = t._id.toString()
    delete t._id
  }
  return {
    txts,
  }
}
