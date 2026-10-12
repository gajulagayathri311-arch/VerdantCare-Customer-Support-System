import { getPool } from "../database/db.js";

export async function getAllArticles(req, res) {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, category, title, summary, content, helpful_count AS helpfulCount, tags FROM knowledge_base ORDER BY id ASC;"
    );

    const formatted = rows.map((r) => ({
      ...r,
      tags: typeof r.tags === "string" ? r.tags.split(",").map((t) => t.trim()) : []
    }));

    res.json(formatted);
  } catch (error) {
    console.error("getAllArticles Error:", error);
    res.status(500).json({ message: "Failed to fetch articles.", error: error.message });
  }
}

export async function voteArticle(req, res) {
  try {
    const { id } = req.params;
    const { isHelpful } = req.body;

    const pool = getPool();
    const delta = isHelpful ? 1 : -1;

    await pool.query(
      "UPDATE knowledge_base SET helpful_count = GREATEST(0, helpful_count + ?) WHERE id = ?;",
      [delta, id]
    );

    const [updated] = await pool.query(
      "SELECT id, helpful_count AS helpfulCount FROM knowledge_base WHERE id = ? LIMIT 1;",
      [id]
    );

    res.json(updated[0] || { id });
  } catch (error) {
    console.error("voteArticle Error:", error);
    res.status(500).json({ message: "Failed to vote on article.", error: error.message });
  }
}
