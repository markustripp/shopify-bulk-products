import fetchLine from 'nodefetchline'
import ora from 'ora'
import { fetchShopify, getQueryCurrentBulk } from '../bin/shopify'

export const stepBulkFetchProducts = async (tag: string) => {
  const spinner = ora('Starting Shopify bulk fetch products').start()

  let bulkOperation: any

  const json = await fetchShopify(getQueryBulkProducts(tag))
  const query = json.data.bulkOperationRunQuery

  if (query.userErrors?.length > 0) {
    throw new Error(
      `Error: ${query.userErrors.map((e: any) => e.message).join(', ')}`,
    )
  } else {
    bulkOperation = query.bulkOperation

    while (bulkOperation.status !== 'COMPLETED') {
      spinner.text = `Shopify bulk operation ${bulkOperation.status} ${bulkOperation.id}`
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const json = await fetchShopify(getQueryCurrentBulk(false))
      bulkOperation = json.data.currentBulkOperation
    }
  }

  spinner.succeed(
    `Shopify bulk fetch products ${bulkOperation.status} ${bulkOperation.id}`,
  )

  return bulkOperation.url
}

export const stepFetchProductResults = async (url: string | null) => {
  const spinner = ora('Shopify bulk fetch product results').start()

  const lineIterator = url ? fetchLine(url) : null
  const productsMap = await parseProducts(lineIterator)

  spinner.succeed(`Shopify Products loaded. ${productsMap.size} products.`)
  return productsMap
}

const parseProducts = async (
  lineIterator: AsyncIterableIterator<string> | null,
) => {
  const productsMap = new Map<string, any>()
  if (!lineIterator) return productsMap

  let currentProduct = null
  for await (const line of lineIterator) {
    if (line.length > 0) {
      const parsedLine = JSON.parse(line)
      if (parsedLine.__parentId) {
        currentProduct.variants.push(parsedLine)
      } else if (parsedLine.id) {
        if (currentProduct) {
          productsMap.set(
            currentProduct.handle,
            structuredClone(currentProduct),
          )
        }

        currentProduct = { ...parsedLine, variants: [] }
      }
    }
  }

  if (currentProduct) {
    productsMap.set(currentProduct.handle, structuredClone(currentProduct))
  }

  return productsMap
}

const getQueryBulkProducts = (tag: string) => `
mutation {
  bulkOperationRunQuery(
   query: """
    {
      products(query: "${tag}") {
        edges {
          node {
            id
    				handle
            title
            totalInventory
            variants {
              edges {
                node {
                  title
                  inventoryQuantity
                  price
                }
              }
            }
          }
        }
      }
    }
    """
  ) {
    bulkOperation {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}
`
