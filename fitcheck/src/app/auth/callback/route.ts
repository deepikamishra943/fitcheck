import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server' // Make sure this path points to your server client!

export async function GET(request: Request) {
  // Grab the URL the user just landed on
  const requestUrl = new URL(request.url)
  
  // Extract the secret code Supabase attached to the link
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    
    // Exchange the code for a secure, logged-in session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 🟢 SUCCESS: The email is verified! Send them smoothly to the closet.
      return NextResponse.redirect(`${origin}/closet`)
    }
  }

  // 🔴 FAIL: If the link is expired or broken, send them back to login with an error.
  return NextResponse.redirect(`${origin}/login?error=Invalid_or_expired_verification_link`)
}