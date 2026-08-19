import crypto from "crypto";
import { CleanMention } from "../types/mention";

export function computeDedupeKey(mention: CleanMention): string {
    const normalizedTitle = (mention.title ?? "").trim().toLowerCase();

    const dateKey = mention.publishedAt
        ? mention.publishedAt.toISOString().slice(0, 10)
        : "";

    const base = [
        mention.source,
        normalizedTitle,
        dateKey,
    ].join("|");

    return crypto
        .createHash("sha256")
        .update(base)
        .digest("hex");
}