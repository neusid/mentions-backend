import { Router, Request, Response } from "express";
import { pool } from "../db/client";

const router = Router();

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

router.get("/mentions", async (req: Request, res: Response) => {
  const { q, source, from, to } = req.query;

  let page = parseInt(String(req.query.page ?? "1"), 10);
  if (isNaN(page) || page < 1) page = 1;

  let limit = parseInt(String(req.query.limit ?? DEFAULT_LIMIT), 10);
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (q) {
    conditions.push(
      `to_tsvector('english', coalesce(title, '') || ' ' || content) @@ plainto_tsquery('english', $${paramIndex})`
    );
    values.push(String(q));
    paramIndex++;
  }

  if (source) {
    conditions.push(`source = $${paramIndex}`);
    values.push(String(source).trim().toLowerCase().replace(/\s+/g, ""));
    paramIndex++;
  }

  if (from) {
    conditions.push(`published_at >= $${paramIndex}`);
    values.push(String(from));
    paramIndex++;
  }

  if (to) {
    conditions.push(`published_at <= $${paramIndex}`);
    values.push(String(to));
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const dataQuery = `SELECT id, external_id, source, title, content, url, author, published_at, engagement, created_at FROM mentions ${whereClause} ORDER BY published_at DESC NULLS LAST, id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const countQuery = `SELECT COUNT(*) FROM mentions ${whereClause}`;

    const dataValues = [...values, limit, offset];

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataValues),
      pool.query(countQuery, values),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return res.status(200).json({
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
