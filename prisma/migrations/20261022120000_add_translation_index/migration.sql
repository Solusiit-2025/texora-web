-- Index untuk lookup terjemahan per entitas + bahasa.
-- Query localizeRows() memakai: WHERE entity = ? AND locale = ?
-- Tanpa index ini, Postgres hanya bisa memakai prefix "entity" dari unique
-- index lalu filter locale -> scan banyak baris di setiap render halaman
-- multi-bahasa (en/zh/ja/de/ar).
CREATE INDEX IF NOT EXISTS "content_translations_entity_locale_idx"
ON "content_translations"("entity", "locale");
