export interface RawMention {
    external_id: string;
    source: string;
    title: string | null;
    content: string;
    url: string;
    author: string | null;
    published_at: string | number | null;
    engagement: number | string;
}

export interface CleanMention {
    externalId: string;
    source: string;
    title: string | null;
    content: string;
    url: string;
    author: string | null;
    publishedAt: Date | null;
    engagement: number;
    dedupeKey: string;
}