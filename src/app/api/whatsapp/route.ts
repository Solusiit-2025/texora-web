import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWhatsAppConfig } from "@/lib/settings";

export const dynamic = "force-dynamic";

type Provider = "fonnte" | "meta";

// -----------------------------------------------------------
// Provider: Fonnte (https://fonnte.com)
// -----------------------------------------------------------
async function sendViaFonnte(to: string, text: string, apiKey: string, deviceId?: string) {
  const cleanTarget = to.replace(/^\+/, "").replace(/[^0-9]/g, "");

  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: cleanTarget,
      message: text,
      countryCode: "62",
      ...(deviceId ? { deviceId } : {}),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status === false || data.status === "false") {
    throw new Error(data.reason || data.message || data.detail || "Fonnte API error");
  }
  return data;
}

// -----------------------------------------------------------
// Provider: Meta WhatsApp Cloud API
// -----------------------------------------------------------
async function sendViaMeta(to: string, text: string, token: string, phoneId: string) {
  const cleanTarget = to.replace(/^\+/, "").replace(/[^0-9]/g, "");

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanTarget,
        text: { body: text },
      }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error?.message || "Meta API error");
  }
  return data;
}

// -----------------------------------------------------------
// Kirim pesan — config dibaca dari DB, fallback .env
// -----------------------------------------------------------
async function sendMessage(to: string, text: string) {
  const cfg = await getWhatsAppConfig();
  const provider = (cfg.provider as Provider) || "fonnte";
  const normalized = to.startsWith("+") ? to : `+${to}`;

  if (provider === "meta") {
    if (!cfg.metaPhoneId || !cfg.metaToken) {
      throw new Error("Token & Phone Number ID Meta belum diatur di Settings");
    }
    return sendViaMeta(normalized, text, cfg.metaToken, cfg.metaPhoneId);
  }

  if (!cfg.fonnteApiKey) {
    throw new Error("Fonnte API Token belum diatur di Settings");
  }
  return sendViaFonnte(normalized, text, cfg.fonnteApiKey, cfg.fonnteDeviceId);
}

// -----------------------------------------------------------
// -----------------------------------------------------------
// Simpan pesan masuk (webhook Fonnte / Meta)
// -----------------------------------------------------------
async function handleInbound(from: string, text: string, name?: string) {
  const digits = from.replace(/[^0-9]/g, "");
  const waNumber = digits.startsWith("0") ? `+62${digits.slice(1)}` : `+${digits}`;

  let conversation = await prisma.whatsAppConversation.findFirst({
    where: { contactNumber: waNumber },
  });

  if (!conversation) {
    conversation = await prisma.whatsAppConversation.create({
      data: {
        contactName: name?.trim() || waNumber,
        contactNumber: waNumber,
        unreadCount: 1,
      },
    });
  } else {
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        unreadCount: { increment: 1 },
        updatedAt: new Date(),
        ...(name && (conversation.contactName === waNumber || !conversation.contactName)
          ? { contactName: name.trim() }
          : {}),
      },
    });
  }

  const message = await prisma.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      from: waNumber,
      to: "sales",
      text,
      direction: "inbound",
      status: "SENT",
    },
  });

  return NextResponse.json({ received: true, conversationId: conversation.id, messageId: message.id });
}

// -----------------------------------------------------------
// Webhook verify (Meta) / health / fetch conversations
// -----------------------------------------------------------
export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // Mendukung GET conversations untuk CRM Inbox (dengan preview pesan terakhir)
  if (action === "conversations") {
    try {
      const conversations = await prisma.whatsAppConversation.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { messages: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      });
      return NextResponse.json({ conversations });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Failed to load conversations" }, { status: 500 });
    }
  }

  // Cek Status Gateway WhatsApp
  if (action === "status") {
    const cfg = await getWhatsAppConfig();
    return NextResponse.json({
      status: "ok",
      provider: cfg.provider,
      hasToken: Boolean(cfg.fonnteApiKey || (cfg.metaToken && cfg.metaPhoneId)),
    });
  }

  // Meta Webhook verification handshake
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const cfg = await getWhatsAppConfig();
  const expected = cfg.webhookToken;

  if (mode === "subscribe" && token === expected && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ status: "ok", provider: cfg.provider });
}

// -----------------------------------------------------------
// Actions: send, conversations, messages, inbound webhook
// -----------------------------------------------------------
export async function POST(req: Request) {
  try {
    let rawBody: Record<string, any> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      rawBody = await req.json().catch(() => ({}));
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        formData.forEach((val, key) => {
          rawBody[key] = typeof val === "string" ? val : val.name || "";
        });
      }
    } else {
      rawBody = await req.json().catch(async () => {
        try {
          const rawText = await req.text();
          return Object.fromEntries(new URLSearchParams(rawText));
        } catch {
          return {};
        }
      });
    }

    const { action, target, from, sender, text, message, name, ...body } = rawBody;

    // 1. Webhook Masuk dari Fonnte (payload: sender, message, name, device, dll.)
    if (!action && sender && (message || text)) {
      return handleInbound(sender, (message || text || "").toString(), name);
    }

    // 1b. Webhook Connect / Message Status / Heartbeat dari Fonnte (tanpa pesan teks)
    if (!action && !sender && !message && !text && (rawBody.device || rawBody.status || rawBody.id)) {
      return NextResponse.json({ status: "ok", received: true, event: rawBody.status || "ack" });
    }

    // 2. Webhook Masuk dari Meta Cloud API (payload: entry[0].changes[0].value.messages[0])
    if (!action && rawBody.entry && Array.isArray(rawBody.entry)) {
      const msgObj = rawBody.entry[0]?.changes?.[0]?.value?.messages?.[0];
      const contactObj = rawBody.entry[0]?.changes?.[0]?.value?.contacts?.[0];
      if (msgObj) {
        const fromNumber = msgObj.from;
        const msgContent = msgObj.text?.body || `[Pesan ${msgObj.type || "media"}]`;
        const profileName = contactObj?.profile?.name;
        return handleInbound(fromNumber, msgContent, profileName);
      }
      return NextResponse.json({ received: true });
    }

    // 3. Webhook Masuk generic / fallback: target/from + message/text
    if (!action && (target || from) && (text ?? message)) {
      return handleInbound(target ?? from, (text ?? message).toString(), name);
    }

    // 4. API Actions
    switch (action) {
      case "send": {
        const recipient = (rawBody.to || body.to || target || from || rawBody.target) as string;
        const msgText = (rawBody.text || text || rawBody.message || message || body.text) as string;
        const conversationId = rawBody.conversationId || body.conversationId;

        if (!recipient || !msgText) {
          return NextResponse.json({ error: "to and text required" }, { status: 400 });
        }

        const meta = await sendMessage(recipient, msgText);

        if (conversationId) {
          await prisma.whatsAppMessage.create({
            data: {
              conversationId,
              from: "sales",
              to: recipient.startsWith("+") ? recipient : `+${recipient}`,
              text: msgText,
              direction: "outbound",
              status: "SENT",
            },
          });
          await prisma.whatsAppConversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });
        }

        const cfg = await getWhatsAppConfig();
        return NextResponse.json({ sent: true, provider: cfg.provider, meta });
      }

      case "conversations": {
        const conversations = await prisma.whatsAppConversation.findMany({
          orderBy: { updatedAt: "desc" },
          include: {
            _count: { select: { messages: true } },
            messages: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        });
        return NextResponse.json({ conversations });
      }

      case "messages": {
        const { conversationId } = body as { conversationId: string };
        const messages = await prisma.whatsAppMessage.findMany({
          where: { conversationId },
          orderBy: { createdAt: "asc" },
        });
        return NextResponse.json({ messages });
      }

      case "mark-read": {
        const { conversationId } = body as { conversationId: string };
        if (conversationId) {
          await prisma.whatsAppConversation.update({
            where: { id: conversationId },
            data: { unreadCount: 0 },
          });
        }
        return NextResponse.json({ success: true });
      }

      // Mulai percakapan baru langsung dari CRM
      case "start-conversation": {
        const { contactNumber, contactName, companyName, customerId, initialMessage } = body as {
          contactNumber: string;
          contactName?: string;
          companyName?: string;
          customerId?: string;
          initialMessage?: string;
        };

        if (!contactNumber) {
          return NextResponse.json({ error: "Nomor kontak WhatsApp wajib diisi" }, { status: 400 });
        }

        const digits = contactNumber.replace(/[^0-9]/g, "");
        const waNumber = digits.startsWith("0") ? `+62${digits.slice(1)}` : `+${digits}`;

        // Pastikan customerId valid sebagai User ID sebelum memasukkannya ke database
        let validCustomerId: string | null = null;
        if (customerId) {
          try {
            const user = await prisma.user.findUnique({ where: { id: customerId } });
            if (user) validCustomerId = customerId;
          } catch {
            validCustomerId = null;
          }
        }

        let conversation = await prisma.whatsAppConversation.findFirst({
          where: { contactNumber: waNumber },
        });

        if (!conversation) {
          conversation = await prisma.whatsAppConversation.create({
            data: {
              contactName: contactName?.trim() || waNumber,
              contactNumber: waNumber,
              companyName: companyName?.trim() || null,
              customerId: validCustomerId,
              unreadCount: 0,
            },
          });
        } else {
          conversation = await prisma.whatsAppConversation.update({
            where: { id: conversation.id },
            data: {
              ...(contactName ? { contactName: contactName.trim() } : {}),
              ...(companyName ? { companyName: companyName.trim() } : {}),
              ...(validCustomerId ? { customerId: validCustomerId } : {}),
              updatedAt: new Date(),
            },
          });
        }

        let meta: any = null;
        if (initialMessage && initialMessage.trim()) {
          meta = await sendMessage(waNumber, initialMessage.trim());
          await prisma.whatsAppMessage.create({
            data: {
              conversationId: conversation.id,
              from: "sales",
              to: waNumber,
              text: initialMessage.trim(),
              direction: "outbound",
              status: "SENT",
            },
          });
        }

        return NextResponse.json({ success: true, conversation, meta });
      }

      // Untuk test manual — simulasi pesan masuk
      case "inbound": {
        const inboundFrom = (rawBody.from || sender || target) as string;
        const inboundText = (rawBody.text || message) as string;
        if (!inboundFrom || !inboundText) {
          return NextResponse.json({ error: "from (atau sender) and text required" }, { status: 400 });
        }
        return handleInbound(inboundFrom, inboundText, name);
      }

      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}


