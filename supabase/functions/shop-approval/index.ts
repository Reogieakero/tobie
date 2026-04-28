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

  if (req.method === 'GET') {
    const id = url.searchParams.get('id')
    await supabase.from('shop_applications').update({ status: 'approved' }).eq('id', id)

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

  try {
    const { applicationId, shopName, applicantEmail } = await req.json()
    const approveLink = `${Deno.env.get('SUPABASE_URL')}/functions/v1/shop-approval?id=${applicationId}`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: 'MatiMawa <onboarding@resend.dev>',
        to: 'reogiem@gmail.com',
        subject: `🛎️ New Shop: ${shopName}`,
        html: `<strong>${applicantEmail}</strong> applied for <strong>${shopName}</strong>.<br><br>
               <a href="${approveLink}">Approve Application</a>`,
      }),
    })

    const result = await res.json()
    return new Response(JSON.stringify(result), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})