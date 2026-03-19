import nodemailer from 'nodemailer'

type SendQuoteIssuedEmailInput = {
  smtpHost: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  fromEmail: string
  toEmails: string[]
  subjectTemplate: string
  bodyTemplate: string
  quoteNumber: string
  companyName: string
  portalUrl: string
}

const replaceVars = (template: string, vars: Record<string, string>) => {
  return Object.entries(vars).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, value)
  }, template)
}

export async function sendQuoteIssuedEmail(input: SendQuoteIssuedEmailInput) {
  const transport = nodemailer.createTransport({
    host: input.smtpHost,
    port: input.smtpPort,
    secure: input.smtpPort === 465,
    auth: {
      user: input.smtpUsername,
      pass: input.smtpPassword
    }
  })

  const vars = {
    quote_number: input.quoteNumber,
    company_name: input.companyName,
    portal_url: input.portalUrl
  }

  const subject = replaceVars(input.subjectTemplate, vars)
  const body = replaceVars(input.bodyTemplate, vars)

  await transport.sendMail({
    from: input.fromEmail,
    to: input.toEmails.join(', '),
    subject,
    text: body
  })
}
