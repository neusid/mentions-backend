import crypto from "crypto";
import { CleanMention } from "../src/types/mention";

export function computeDedupeKey(
  mention: Omit<CleanMention, "dedupeKey">
): string {
  const titleOrContent = (mention.title ?? mention.content)
    .trim()
    .toLowerCase();

  const dateKey = mention.publishedAt
    ? mention.publishedAt.toISOString().slice(0, 10)
    : "";

  const base = [
    mention.source,
    titleOrContent,
    dateKey,
  ].join("|");

  return crypto
    .createHash("sha256")
    .update(base)
    .digest("hex");
}