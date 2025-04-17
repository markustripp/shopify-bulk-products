#!/usr/bin/env node

import { program } from 'commander'
import 'dotenv/config'
import { sync } from '../actions/sync'
import { validateEnv } from './utils'

try {
  validateEnv()

  program
    .name('Shopify Bulk Product Sync')
    .description(
      'Load products from ERP export and Shopify, create or update changes via Shopify bulk process',
    )
    .version('1.0.0', '-v, --version', 'display the version number')

  program
    .description('Shopify Sync')
    .option('-f --file <file>', 'ERP export file')
    .action(sync)

  await program.parseAsync()
} catch (error) {
  console.error(error)
}

process.exit(0)

