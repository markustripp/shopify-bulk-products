import ora from 'ora'
import { Resend } from 'resend'
import { type StatusEmailParams, ResendStatusEmail } from '../bin/email'

export const stepSendEmail = async (params: StatusEmailParams) => {
  const spinner = ora('Sending Email').start()

  if (!process.env.RESEND_API_KEY) {
    spinner.fail('No Resend API Key found')
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'Resend <onboarding@resend.dev>',
    to: process.env.RESEND_TO!,
    subject: 'Shopify Bulk Import Status',
    react: await ResendStatusEmail(params),
  })

  spinner.succeed('Email sent')
}
