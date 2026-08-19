import { RawMention, CleanMention } from "../types/mention";

function stripHtml(input: string): string {
    return input
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeSource(source: string): string {
    return source.trim().toLowerCase().replace(/\s+/g, "");
}

function normalizeDate(value: string | number | null): Date | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    if (typeof value === "number") {
        const date = new Date(value * 1000);
        return isNaN(date.getTime()) ? null : date;
    }

    const ddmmyyyy = value.match(
        /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/
    );

    if (ddmmyyyy) {
        const [
            ,
            day,
            month,
            year,
            hour = "00",
            minute = "00",
            second = "00",
        ] = ddmmyyyy;

        const date = new Date(
            Date.UTC(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hour),
                Number(minute),
                Number(second)
            )
        );

        return isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(value);

    return isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeEngagement(value: number | string): number {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    const cleaned = value.replace(/,/g, "").trim();
    const parsed = Number(cleaned);

    return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeMention(raw: RawMention): CleanMention {
    return {
        externalId: raw.external_id,
        source: normalizeSource(raw.source),
        title: raw.title ? stripHtml(raw.title) : null,
        content: stripHtml(raw.content),
        url: raw.url,
        author: raw.author ? raw.author.trim() : null,
        publishedAt: normalizeDate(raw.published_at),
        engagement: normalizeEngagement(raw.engagement),
        dedupeKey: "",
    };
}

export const _internal = {
    stripHtml,
    normalizeSource,
    normalizeDate,
    normalizeEngagement,
};