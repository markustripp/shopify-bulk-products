import { readFileSync } from 'fs'
import ora from 'ora'

export const stepParseErp = async (
  file: string | undefined,
): Promise<Map<string, any>> => {
  const spinner = ora(`Parse ERP data (e.g. XML, CSV, JSON)`).start()

  const content = file ? readFileSync(file, 'utf-8') : erpDemoExport
  const erpProducts = parse(content)

  spinner.succeed(`Data parsed sucessfully. ${erpProducts.size} products.`)

  return erpProducts
}

const parse = (content: string): Map<string, any> => {
  const products = new Map<string, any>()
  const data = JSON.parse(content)

  for (const product of data) {
    products.set(product.handle, product)
  }

  return products
}

const erpDemoExport = `[
  {
    "handle": "the-collection-snowboard-oxygen",
    "title": "The Collection Snowboard Oxygen",
    "descriptionHtml": "<p>Description of the product The Collection Snowboard Oxygen</p>",
    "vendor": "Hydrogen Vendor",
    "image": "https://images.unsplash.com/photo-1614358536373-1ce27819009e?q=80&w=1200&auto=format&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "variants": [
      {
        "size": "S",
        "price": 999.0,
        "stock": 12
      },
      {
        "size": "M",
        "price": 1099.0,
        "stock": 20
      },
      {
        "size": "L",
        "price": 1199.0,
        "stock": 0
      }
    ]
  },
  {
    "handle": "the-multi-location-snowboard",
    "title": "The Multi-location Snowboard",
    "descriptionHtml": "<p>Description of the product The Multi-location Snowboard</p>",
    "vendor": "Hydrogen Vendor",
    "image": "https://images.unsplash.com/photo-1593462215105-0addc26b1a5f?q=80&w=1200&auto=format&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "variants": [
      {
        "size": "S",
        "price": 899.0,
        "stock": 10
      },
      {
        "size": "M",
        "price": 999.0,
        "stock": 22
      },
      {
        "size": "L",
        "price": 1099.0,
        "stock": 15
      }
    ]
  }
]
`
