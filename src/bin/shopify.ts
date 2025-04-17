export const fetchShopify = async (query: string) => {
  const res = await fetch(process.env.SHOPIFY_GRAPHQL_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
    },
    body: JSON.stringify({ query }),
  })

  return await res.json()
}

export const getQueryCurrentBulk = (mutation: boolean) => `
query {
  currentBulkOperation(type: ${mutation ? 'MUTATION' : 'QUERY'}) {
    id
    status
    errorCode
    createdAt
    completedAt
    objectCount
    fileSize
    url
    partialDataUrl
  }
}
`
