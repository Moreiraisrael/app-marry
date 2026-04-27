import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const destinationUrl = searchParams.get("url")
  const itemType = searchParams.get("type") // 'store', 'coupon', 'product', etc.
  const itemId = searchParams.get("id")

  if (!destinationUrl || !itemType) {
    return NextResponse.json({ error: "Missing url or type parameters" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    await supabase.from("analytics_clicks").insert({
      client_id: user?.id || null,
      destination_url: destinationUrl,
      item_type: itemType,
      item_id: itemId || null
    })
  } catch (error) {
    console.error("Failed to track click:", error)
    // Continue redirecting even if tracking fails to not break UX
  }

  return NextResponse.redirect(destinationUrl)
}
