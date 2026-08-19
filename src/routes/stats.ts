import { Router, Request, Response } from "express";
import { pool } from "../db/client";

const router = Router();

router.get("/mentions/stats", async (req: Request, res: Response) => {
  const groupBy = String(req.query.group_by ?? "");

  if (groupBy !== "source" && groupBy !== "day") {
    return res.status(400).json({
      error: "Query param group_by wajib diisi 'source' atau 'day'",
    });
  }

  try {
    if (groupBy === "source") {
      const result = await pool.query(`
        SELECT source, COUNT(*) AS count
        FROM mentions
        GROUP BY source
        ORDER BY count DESC
      `);
      return res.status(200).json({
        group_by: "source",
        data: result.rows.map((r) => ({
          source: r.source,
          count: parseInt(r.count, 10),
        })),
      });
    }

    const result = await pool.query(` SELECT COALESCE(TO_CHAR(published_at, 'YYYY-MM-DD'), 'unknown') AS day, COUNT(*) AS count FROM mentions GROUP BY day ORDER BY day ASC `);

    return res.status(200).json({
      group_by: "day",
      data: result.rows.map((r) => ({
        day: r.day,
        count: parseInt(r.count, 10),
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
