import ora from 'ora'

export const stepPrepareImport = async (
  erpProducts: Map<string, any>,
  shopifyProducts: Map<string, any>,
) => {
  const spinner = ora('Preparing JSONL').start()
  const jsonl: any[] = []

  for (const value of erpProducts.values()) {
    const product = shopifyProducts.get(value.handle)

    const input = getJsonlInput(value, product)
    if (input) {
      jsonl.push(JSON.stringify(input) + '\n')
    }
  }

  spinner.succeed(`JSONL prepared. ${jsonl.length} lines,`)

  return jsonl
}

const getJsonlInput = (erpProduct: any, shopifyProduct: any) => {
  const input: any = {
    handle: erpProduct.handle,
    title: getTitle(erpProduct, shopifyProduct),
    descriptionHtml: getDescriptionHtml(erpProduct, shopifyProduct),
    status: 'ACTIVE',
    tags: getTags(erpProduct, shopifyProduct),
    productOptions: getProductOptions(erpProduct),
    variants: getVariants(erpProduct),
    metafields: getMetafields(erpProduct),
    vendor: getVendor(erpProduct, shopifyProduct),
  }

  if (shopifyProduct) {
    // update product
    input.id = shopifyProduct.id
  } else {
    // create product
    input.files = [
      {
        alt: erpProduct.title,
        contentType: 'IMAGE',
        originalSource: erpProduct.image,
      },
    ]
  }

  return { input }
}

const getTitle = (erpProduct: any, shopifyProduct: any) => {
  // get title from erp product or shopify product
  return shopifyProduct?.title ?? erpProduct.title
}

const getDescriptionHtml = (erpProduct: any, shopifyProduct: any) => {
  // get description from erp product or shopify product
  return shopifyProduct?.descriptionHtml ?? erpProduct.descriptionHtml
}

const getTags = (erpProduct: any, shopifyProduct: any) => {
  // get tags from erp product or shopify product
  return ['sync']
}

const getProductOptions = (erpProduct: any) => {
  return [
    {
      name: 'Size',
      values: erpProduct.variants.map((variant: any) => ({
        name: variant.size,
      })),
    },
  ]
}

const getVariants = (erpProducts: any) => {
  return erpProducts.variants.map((variant: any) => {
    const newVariant: any = {
      optionValues: [
        {
          optionName: 'Size',
          name: variant.size,
        },
      ],
      price: variant.price,
      inventoryItem: {
        tracked: true,
      },
      inventoryQuantities: [
        {
          locationId: process.env.SHOPIFY_LOCATION_ID!,
          name: 'available',
          quantity: variant.stock,
        },
      ],
    }

    return newVariant
  })
}

const getMetafields = (erpProduct: any) => {
  const metafields: any[] = []

  // metafields.push({
  //   namespace: 'custom',
  //   key: 'mykey',
  //   value: erpProduct.myvalue,
  // })

  return metafields
}

const getVendor = (erpProduct: any, shopifyProduct: any) => {
  // get vendor from erp product or shopify product
  return shopifyProduct?.vendor ?? erpProduct.vendor
}
