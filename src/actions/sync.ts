import ora from 'ora'
import { stepParseErp } from './step-01-erp'
import {
  stepBulkFetchProducts,
  stepFetchProductResults,
} from './step-02-products'
import { stepPrepareImport } from './step-03-prepare'
import { stepBulkImport, stepBulkImportResult } from './step-04-import'
import { formatDuration } from '../bin/utils'
import { stepSendEmail } from './step-05-email'

// Shopify has a limit of 20MB for file uploads incl. JSONL
const MAX_JSONL_LINES = 1000

export const sync = async (
  options: Record<string, string | boolean | number>,
) => {
  const start = Date.now()

  const erpProducts = await stepParseErp(options.file as string)

  const productsUrl = await stepBulkFetchProducts('tag:sync')
  const shopifyProducts = await stepFetchProductResults(productsUrl)

  const jsonl = await stepPrepareImport(erpProducts, shopifyProducts)

  const totalErrors: string[] = []
  for (let i = 0; i < jsonl.length; i += MAX_JSONL_LINES) {
    const chunk = jsonl.slice(i, i + MAX_JSONL_LINES)

    const importUrl = await stepBulkImport(chunk)
    const errors = await stepBulkImportResult(importUrl, chunk)

    totalErrors.push(...errors)
  }

  const duration = formatDuration(Date.now() - start)
  await stepSendEmail({
    numberOfProducts: erpProducts.size,
    numberOfErrors: totalErrors.length,
    duration,
  })

  ora(`Finished. ${totalErrors.length} errors. (${duration})`).succeed()

  if (totalErrors.length > 0) {
    console.log(`\n\nErrors:\n${totalErrors.join('\n')}`)
  }
}
