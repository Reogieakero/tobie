import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
import { serve } from "https://deno.land/std@0.131.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const url = new URL(req.url)

  // ── TEST ENDPOINT — hit this manually to confirm Resend works ──
  // GET /functions/v1/shop-approval?test=true
  if (req.method === 'GET' && url.searchParams.get('test') === 'true') {
    const apiKey = Deno.env.get('RESEND_API_KEY')
    console.log('RESEND_API_KEY present:', !!apiKey)
    console.log('RESEND_API_KEY value:', apiKey?.slice(0, 8) + '...') // log first 8 chars only

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'MatiMawa <onboarding@resend.dev>',
        to: ['reogiem@gmail.com'],
        subject: 'TEST — Resend is working ✅',
        html: '<p>If you see this, Resend is configured correctly.</p>',
      }),
    })

    const result = await res.json()
    console.log('Resend test response status:', res.status)
    console.log('Resend test response body:', JSON.stringify(result))

    return new Response(JSON.stringify({ status: res.status, result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── APPROVE (GET) ────────────────────────────────────────
  if (req.method === 'GET') {
    const id = url.searchParams.get('id')
    console.log('Approving application id:', id)

    const { error } = await supabase
      .from('shop_applications')
      .update({ status: 'approved' })
      .eq('id', id)

    if (error) console.error('DB update error:', error)

    return new Response(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #f9fafb;">
          <div style="max-width: 400px; margin: auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #22c55e;">Status Updated</h1>
            <p style="color: #4b5563;">The shop is now <b>Active</b>.</p>
            <div style="font-size: 40px;">✅</div>
          </div>
        </body>
      </html>
    `, { headers: { ...corsHeaders, 'Content-Type': 'text/html' } })
  }

  // ── NOTIFY ADMIN (POST) ──────────────────────────────────
  try {
    const body = await req.json()
    console.log('Received POST body:', JSON.stringify(body)) // ← see if function is even called

    const { applicationId, shopName, applicantEmail } = body

    if (!applicationId || !shopName || !applicantEmail) {
      throw new Error(`Missing fields: applicationId=${applicationId}, shopName=${shopName}, applicantEmail=${applicantEmail}`)
    }

    const approveLink = `${Deno.env.get('SUPABASE_URL')}/functions/v1/shop-approval?id=${applicationId}`
    const apiKey = Deno.env.get('RESEND_API_KEY')

    console.log('RESEND_API_KEY present:', !!apiKey)
    console.log('Sending to: reogiem@gmail.com')
    console.log('Approve link:', approveLink)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'MatiMawa <onboarding@resend.dev>',
        to: ['reogiem@gmail.com'],
        subject: `🛎️ New Shop Application: ${shopName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2>🛎️ New Shop Application</h2>
            <p><strong>Applicant:</strong> ${applicantEmail}</p>
            <p><strong>Shop Name:</strong> ${shopName}</p>
            <br/>
            <a href="${approveLink}"
               style="background:#111;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
              ✅ Approve Application
            </a>
          </div>
        `,
      }),
    })

    const result = await res.json()
    console.log('Resend status:', res.status)
    console.log('Resend body:', JSON.stringify(result))

    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Resend error: ${JSON.stringify(result)}`)
    }

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('FUNCTION ERROR:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})