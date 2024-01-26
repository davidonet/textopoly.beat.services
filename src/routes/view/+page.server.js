import { dataSources } from '$lib/server/mongo.js'

export async function load({ url }) {
  const top = Number(url.searchParams.get('top'))
  const right = Number(url.searchParams.get('right'))
  const bottom = Number(url.searchParams.get('bottom'))
  const left = Number(url.searchParams.get('left'))
  const txt = await dataSources.txt

  return {
    props: {
      page,
      path,
      author,
    },
  }
}
