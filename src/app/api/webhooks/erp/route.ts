import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-texora-signature") || "mock-valid-sig";
    const body = await request.json().catch(() => ({ event: "PING" }));

    // Log ERP event
    console.log("[ERP Webhook Received]:", body.event || "UNKNOWN", {
      timestamp: new Date().toISOString(),
      signature,
    });

    return NextResponse.json({
      success: true,
      received: true,
      event: body.event || "SYNC_ACKNOWLEDGED",
      processedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
