-- Index performa: semua kolom relasi (FK-style) + kolom filter/sort
-- yang dipakai query panas API. Nama mengikuti konvensi penamaan index Prisma.
-- Aman dijalankan ulang (idempotent, IF NOT EXISTS).

-- users
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users ("role");

-- fabric_products
CREATE INDEX IF NOT EXISTS fabric_products_category_iscategory_idx ON public.fabric_products (category, "isSublimationReady");

-- fabric_variants
CREATE INDEX IF NOT EXISTS fabric_variants_productId_idx ON public.fabric_variants ("productId");

-- price_tiers
CREATE INDEX IF NOT EXISTS price_tiers_productId_minMeters_idx ON public.price_tiers ("productId", "minMeters");

-- custom_designs
CREATE INDEX IF NOT EXISTS custom_designs_customerId_status_idx ON public.custom_designs ("customerId", "status");

-- orders
CREATE INDEX IF NOT EXISTS orders_customerId_createdAt_idx ON public.orders ("customerId", "createdAt");
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders ("status");

-- order_items
CREATE INDEX IF NOT EXISTS order_items_orderId_idx ON public.order_items ("orderId");
CREATE INDEX IF NOT EXISTS order_items_fabricVariantId_idx ON public.order_items ("fabricVariantId");
CREATE INDEX IF NOT EXISTS order_items_customDesignId_idx ON public.order_items ("customDesignId");

-- leads
CREATE INDEX IF NOT EXISTS leads_assignedSalesId_updatedAt_idx ON public.leads ("assignedSalesId", "updatedAt");
CREATE INDEX IF NOT EXISTS leads_customerId_idx ON public.leads ("customerId");
CREATE INDEX IF NOT EXISTS leads_stage_createdAt_idx ON public.leads ("stage", "createdAt");

-- activity_logs
CREATE INDEX IF NOT EXISTS activity_logs_leadId_idx ON public.activity_logs ("leadId");
CREATE INDEX IF NOT EXISTS activity_logs_userId_createdAt_idx ON public.activity_logs ("userId", "createdAt");

-- inventory_rolls
CREATE INDEX IF NOT EXISTS inventory_rolls_fabricVariantId_idx ON public.inventory_rolls ("fabricVariantId");
CREATE INDEX IF NOT EXISTS inventory_rolls_batchLot_idx ON public.inventory_rolls ("batchLot");

-- whatsapp_conversations
CREATE INDEX IF NOT EXISTS whatsapp_conversations_customerId_idx ON public.whatsapp_conversations ("customerId");
CREATE INDEX IF NOT EXISTS whatsapp_conversations_updatedAt_idx ON public.whatsapp_conversations ("updatedAt");
CREATE INDEX IF NOT EXISTS whatsapp_conversations_contactNumber_idx ON public.whatsapp_conversations ("contactNumber");

-- whatsapp_messages
CREATE INDEX IF NOT EXISTS whatsapp_messages_conversationId_createdAt_idx ON public.whatsapp_messages ("conversationId", "createdAt");
CREATE INDEX IF NOT EXISTS whatsapp_messages_from_idx ON public.whatsapp_messages ("from");

-- social_comments
CREATE INDEX IF NOT EXISTS social_comments_platform_createdAt_idx ON public.social_comments ("platform", "createdAt");
CREATE INDEX IF NOT EXISTS social_comments_sentiment_idx ON public.social_comments ("sentiment");
CREATE INDEX IF NOT EXISTS social_comments_postId_idx ON public.social_comments ("postId");
CREATE INDEX IF NOT EXISTS social_comments_timestamp_idx ON public.social_comments ("timestamp");

-- audit_logs
CREATE INDEX IF NOT EXISTS audit_logs_createdAt_idx ON public.audit_logs ("createdAt");
CREATE INDEX IF NOT EXISTS audit_logs_userId_createdAt_idx ON public.audit_logs ("userId", "createdAt");
