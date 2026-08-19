CREATE TABLE IF NOT EXISTS mentions (
    id BIGSERIAL PRIMARY KEY,
    external_id TEXT NOT NULL,
    source TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    url TEXT NOT NULL,
    author TEXT,
    published_at TIMESTAMPTZ,
    engagement BIGINT NOT NULL DEFAULT 0,
    dedupe_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentions_source ON mentions(source);

CREATE INDEX IF NOT EXISTS idx_mentions_published_at ON mentions(published_at);

CREATE INDEX IF NOT EXISTS idx_mentions_external_id ON mentions(external_id);