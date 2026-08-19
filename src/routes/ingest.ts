import { Router, Request, Response } from "express";
import { pool } from "../db/client";
import { RawMention } from "../types/mention";
import { normalizeMention } from "../services/normalize";
import { computeDedupeKey } from "../services/dedupe";

const router = Router();

router.post(
  "/internal/mentions/bulk",
  async (req: Request, res: Response) => {
    const rawMentions: RawMention[] = req.body;

    if (!Array.isArray(rawMentions)) {
      return res
        .status(400)
        .json({ error: "Request body harus berupa array of mentions" });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    const errors: { index: number; message: string }[] = [];

    for (let i = 0; i < rawMentions.length; i++) {
      try {
        const clean = normalizeMention(rawMentions[i]);
        const dedupeKey = computeDedupeKey(clean);

        const result = await pool.query(
          `INSERT INTO mentions (external_id, source, title, content, url, author, published_at, engagement, dedupe_key) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (dedupe_key) DO NOTHING RETURNING id`,
          [
            clean.externalId,
            clean.source,
            clean.title,
            clean.content,
            clean.url,
            clean.author,
            clean.publishedAt,
            clean.engagement,
            dedupeKey,
          ]
        );

        if (result.rows.length > 0) {
          insertedCount++;
        } else {
          skippedCount++;
        }
      } catch (err: any) {
        errors.push({ index: i, message: err.message });
      }
    }

    return res.status(200).json({
      received: rawMentions.length,
      inserted: insertedCount,
      skipped_duplicates: skippedCount,
      errors,
    });
  }
);

export default router;
