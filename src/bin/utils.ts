import { existsSync, writeFileSync } from 'fs'

export const formatDuration = (ms: number) => {
  if (ms < 0) ms = -ms
  const time = {
    day: Math.floor(ms / 86400000),
    hour: Math.floor(ms / 3600000) % 24,
    minute: Math.floor(ms / 60000) % 60,
    second: Math.floor(ms / 1000) % 60,
    millisecond: Math.floor(ms) % 1000,
  }
  return Object.entries(time)
    .filter((val) => val[1] !== 0)
    .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
    .join(', ')
}

export const validateEnv = () => {
  if (!existsSync('.env')) {
    console.log('No .env file found. Generating...')
    writeFileSync('.env', dotenv)
    process.exit(1)
  }

  if (!process.env.SHOPIFY_ACCESS_TOKEN) {
    console.log('No SHOPIFY_ACCESS_TOKEN found. Check .env file.')
    process.exit(1)
  }
}

const dotenv = `
# required
SHOPIFY_GRAPHQL_URL=https://<store-name>.myshopify.com/admin/api/2025-04/graphql.json
SHOPIFY_ACCESS_TOKEN=
SHOPIFY_LOCATION_ID=gid://shopify/Location/999

# optional: Send email via https://resend.com
RESEND_API_KEY=
RESEND_TO=name@example.com
`
