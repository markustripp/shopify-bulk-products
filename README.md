# Shopify Bulk Import

Demo implementation of a TypeScript CLI that uses Shopify bulk fetch and import via GraphQL. For a detailed documentation find the related article on [Medium](https://medium.com).

## Quick Start

You can execute the script via

```
npx markustripp-shopify-bulk-import@latest
```

### Requirements

- Shopify Development Store
- Shopify Access Token
- Shopify Location for your inventory
- Shopify Online Store Sales Channel set to ```autopublish: true````
- (optional) Resend API Key
- Configuration added to .env file in execution directory

### .env

```
# required
SHOPIFY_GRAPHQL_URL=https://<store-name>.myshopify.com/admin/api/2025-04/graphql.json
SHOPIFY_ACCESS_TOKEN=
SHOPIFY_LOCATION_ID=gid://shopify/Location/999

# optional: Send email via https://resend.com
RESEND_API_KEY=
RESEND_TO=name@example.com
```
