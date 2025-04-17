import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import * as React from 'react'

export type StatusEmailParams = {
  duration: string
  numberOfProducts: number
  numberOfErrors: number
}

export const ResendStatusEmail: React.FC<StatusEmailParams> = ({
  numberOfProducts,
  numberOfErrors,
  duration,
}) => {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Shopify Bulk Import Status</Preview>
        <Body
          style={{
            fontFamily:
              '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
          }}
          className="p-4 text-gray-800 bg-white"
        >
          <Container>
            <Heading className="text-2xl font-bold">
              Shopify Bulk Import Status
            </Heading>
            <Section className="my-8 px-8 py-3 bg-gray-100 rounded-lg">
              <Text className="text-gray-600">
                {numberOfProducts} products from ERP.
                <br />
                {numberOfErrors} errors.
                <br />
                Duration: {duration}
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

export default ResendStatusEmail
