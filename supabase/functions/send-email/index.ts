import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  to: string
  subject: string
  body: string
  recipientName: string
}

interface SMTPConfig {
  host: string
  port: number
  username: string
  password: string
  from_email: string
  from_name: string
  encryption: 'none' | 'tls' | 'ssl'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request body
    const { emailData, logId }: { emailData: EmailRequest; logId: string } = await req.json()

    // Get SMTP settings from database
    const { data: smtpSettings, error: smtpError } = await supabaseClient
      .from('smtp_settings')
      .select('*')
      .eq('id', 'global_smtp_settings')
      .single()

    if (smtpError || !smtpSettings) {
      throw new Error('SMTP settings not found or not configured')
    }

    if (!smtpSettings.enabled) {
      throw new Error('SMTP is not enabled')
    }

    // Validate SMTP configuration
    if (!smtpSettings.host || !smtpSettings.username || !smtpSettings.password || !smtpSettings.from_email) {
      throw new Error('SMTP configuration is incomplete')
    }

    // Send email using SMTP
    const emailResult = await sendSMTPEmail(smtpSettings, emailData)

    if (emailResult.success) {
      // Update email log status to 'sent'
      await supabaseClient
        .from('email_logs')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', logId)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully',
          messageId: emailResult.messageId 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      // Update email log status to 'failed'
      await supabaseClient
        .from('email_logs')
        .update({ 
          status: 'failed', 
          error_message: emailResult.error 
        })
        .eq('id', logId)

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: emailResult.error 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

  } catch (error) {
    console.error('Error in send-email function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function sendSMTPEmail(smtpConfig: SMTPConfig, emailData: EmailRequest): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    // Create the email message
    const message = createEmailMessage(smtpConfig, emailData)
    
    // Connect to SMTP server and send email
    const result = await sendViaSMTP(smtpConfig, emailData.to, message)
    
    return result
  } catch (error) {
    console.error('SMTP sending error:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to send email via SMTP' 
    }
  }
}

function createEmailMessage(smtpConfig: SMTPConfig, emailData: EmailRequest): string {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const messageId = `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${smtpConfig.host}>`
  
  const headers = [
    `Message-ID: ${messageId}`,
    `Date: ${new Date().toUTCString()}`,
    `From: ${smtpConfig.from_name} <${smtpConfig.from_email}>`,
    `To: ${emailData.recipientName} <${emailData.to}>`,
    `Subject: ${emailData.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `X-Mailer: Kirods Hosting Knowledge Base`,
    ''
  ].join('\r\n')

  const textBody = emailData.body.replace(/<[^>]*>/g, '').replace(/\n/g, '\r\n')
  const htmlBody = emailData.body.replace(/\n/g, '<br>')

  const body = [
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    '',
    textBody,
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    '',
    `<!DOCTYPE html>`,
    `<html>`,
    `<head><meta charset="utf-8"><title>${emailData.subject}</title></head>`,
    `<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">`,
    `<div style="max-width: 600px; margin: 0 auto; padding: 20px;">`,
    htmlBody,
    `</div>`,
    `</body>`,
    `</html>`,
    '',
    `--${boundary}--`,
    ''
  ].join('\r\n')

  return headers + body
}

async function sendViaSMTP(smtpConfig: SMTPConfig, to: string, message: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    // For demonstration, we'll use a simple TCP connection approach
    // In a real implementation, you'd use a proper SMTP library
    
    const port = smtpConfig.port
    const host = smtpConfig.host
    
    // Create connection based on encryption type
    let conn: Deno.TcpConn | Deno.TlsConn
    
    if (smtpConfig.encryption === 'ssl') {
      // Direct SSL connection
      conn = await Deno.connectTls({ hostname: host, port })
    } else {
      // Plain connection (will upgrade to TLS if needed)
      conn = await Deno.connect({ hostname: host, port })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Helper function to send command and read response
    async function sendCommand(command: string): Promise<string> {
      await conn.write(encoder.encode(command + '\r\n'))
      const buffer = new Uint8Array(1024)
      const bytesRead = await conn.read(buffer)
      return decoder.decode(buffer.subarray(0, bytesRead || 0))
    }

    // SMTP conversation
    let response = await sendCommand('')
    if (!response.startsWith('220')) {
      throw new Error(`SMTP connection failed: ${response}`)
    }

    // EHLO
    response = await sendCommand(`EHLO ${host}`)
    if (!response.startsWith('250')) {
      throw new Error(`EHLO failed: ${response}`)
    }

    // STARTTLS if needed
    if (smtpConfig.encryption === 'tls' && response.includes('STARTTLS')) {
      response = await sendCommand('STARTTLS')
      if (!response.startsWith('220')) {
        throw new Error(`STARTTLS failed: ${response}`)
      }
      
      // Upgrade connection to TLS
      conn.close()
      conn = await Deno.connectTls({ hostname: host, port })
      
      // Re-send EHLO after TLS upgrade
      response = await sendCommand(`EHLO ${host}`)
      if (!response.startsWith('250')) {
        throw new Error(`EHLO after TLS failed: ${response}`)
      }
    }

    // AUTH LOGIN
    response = await sendCommand('AUTH LOGIN')
    if (!response.startsWith('334')) {
      throw new Error(`AUTH LOGIN failed: ${response}`)
    }

    // Send username (base64 encoded)
    const username = btoa(smtpConfig.username)
    response = await sendCommand(username)
    if (!response.startsWith('334')) {
      throw new Error(`Username authentication failed: ${response}`)
    }

    // Send password (base64 encoded)
    const password = btoa(smtpConfig.password)
    response = await sendCommand(password)
    if (!response.startsWith('235')) {
      throw new Error(`Password authentication failed: ${response}`)
    }

    // MAIL FROM
    response = await sendCommand(`MAIL FROM:<${smtpConfig.from_email}>`)
    if (!response.startsWith('250')) {
      throw new Error(`MAIL FROM failed: ${response}`)
    }

    // RCPT TO
    response = await sendCommand(`RCPT TO:<${to}>`)
    if (!response.startsWith('250')) {
      throw new Error(`RCPT TO failed: ${response}`)
    }

    // DATA
    response = await sendCommand('DATA')
    if (!response.startsWith('354')) {
      throw new Error(`DATA command failed: ${response}`)
    }

    // Send message
    response = await sendCommand(message + '\r\n.')
    if (!response.startsWith('250')) {
      throw new Error(`Message sending failed: ${response}`)
    }

    // QUIT
    await sendCommand('QUIT')
    conn.close()

    // Extract message ID from response if available
    const messageIdMatch = response.match(/Message-ID:\s*<([^>]+)>/)
    const messageId = messageIdMatch ? messageIdMatch[1] : `sent_${Date.now()}`

    return { 
      success: true, 
      messageId 
    }

  } catch (error) {
    console.error('SMTP sending error:', error)
    return { 
      success: false, 
      error: error.message || 'SMTP connection failed' 
    }
  }
}