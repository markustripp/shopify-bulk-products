import fetchLine from 'nodefetchline'
import ora from 'ora'
import { fetchShopify, getQueryCurrentBulk } from '../bin/shopify'

export const stepBulkImport = async (jsonl: any[]) => {
  if (jsonl.length === 0) {
    ora('Skip Bulk Import').succeed()
    return null
  }

  const spinner = ora('Start Bulk Import').start()

  let bulkOperation: any = null

  const json = await fetchShopify(mutationStagedUploadsCreate)

  const targets = json.data.stagedUploadsCreate.stagedTargets
  if (targets.length === 1) {
    const { url, parameters } = targets[0]
    let stagedUploadPath = ''

    const formData = new FormData()
    for (const parameter of parameters) {
      formData.append(parameter.name, parameter.value)
      if (parameter.name === 'key') {
        stagedUploadPath = parameter.value
      }
    }
    const file = new Blob(jsonl, { type: 'text/jsonl' })
    formData.append('file', file)

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error: ${response.statusText} ${errorText}`)
    }

    const mutation = mutationProductsSet.replace(/\s+/g, ' ').trim()
    const jsonMutation = await fetchShopify(
      getMutationBulkRun(mutation, stagedUploadPath),
    )

    const bulk = jsonMutation.data.bulkOperationRunMutation
    if (bulk.userErrors?.length > 0) {
      throw new Error(
        `Error: ${bulk.userErrors.map((e: any) => e.message).join(', ')}`,
      )
    } else {
      bulkOperation = bulk.bulkOperation

      while (bulkOperation.status !== 'COMPLETED') {
        spinner.text = `Shopify Bulk Import ${bulkOperation.status} ${bulkOperation.id}`
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const jsonBulk = await fetchShopify(getQueryCurrentBulk(true))
        bulkOperation = jsonBulk.data.currentBulkOperation
      }
    }
  }

  spinner.succeed(
    `Shopify Bulk Import ${bulkOperation.status} ${bulkOperation.id}`,
  )

  return bulkOperation.url
}

export const stepBulkImportResult = async (
  url: string | null,
  jsonl: any[],
) => {
  if (!url || jsonl.length === 0) {
    ora('Skip Import Result').succeed()
    return []
  }

  const spinner = ora('Fetching Import Result').start()

  const lineIterator = fetchLine(url)
  const errors = await parseImportResult(lineIterator, jsonl)

  spinner.succeed('Import Result fetched')

  return errors
}

const parseImportResult = async (
  lineIterator: AsyncIterableIterator<string>,
  jsonl: any[],
) => {
  const errors: string[] = []

  let i = 0
  for await (const line of lineIterator) {
    if (line.length > 0) {
      const parsedLine = JSON.parse(line)
      if (parsedLine.data.productSet.userErrors.length > 0) {
        errors.push(line + jsonl[i] + '\n')
      }
    }
    i++
  }

  return errors
}

const mutationStagedUploadsCreate = `
mutation {
  stagedUploadsCreate(input: {
    resource: BULK_MUTATION_VARIABLES,
    filename: "bulk_op_vars",
    mimeType: "text/jsonl",
    httpMethod: POST
  }){
    userErrors{
      field,
      message
    },
    stagedTargets{
      url,
      resourceUrl,
      parameters {
        name,
        value
      }
    }
  }
}
`

const mutationProductsSet = `
mutation productSet($input: ProductSetInput!) {
  productSet(input: $input) {
    product {
      id
      handle
      title
    }
    productSetOperation {
      id
      status
      userErrors {
        code
        field
        message
      }
    }
    userErrors {
      code
      field
      message
    }
  }
}
`

const getMutationBulkRun = (mutation: string, stagedUploadPath: string) => `
mutation {
  bulkOperationRunMutation(
    mutation: "${mutation}",
    stagedUploadPath: "${stagedUploadPath}") {
    bulkOperation {
      id
      url
      status
    }
    userErrors {
      message
      field
    }
  }
}
`
