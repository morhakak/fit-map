import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res
      .status(400)
      .json({ error: 'Missing or invalid query parameter "q"' });
  }

  try {
    const response = await axios.get(import.meta.env.VITE_DATA_API_BASE, {
      params: {
        resource_id: import.meta.env.VITE_DATA_API_SOURCE_ID,
        q,
        fields:
          "_id,רשות מקומית,מספר זיהוי,שם המתקן,סוג מתקן,רחוב,מספר בית,פנוי לפעילות,תאורה קיימת,נגישות לנכים,מצב המתקן,חניה לרכבים,משרת בית ספר,ציר X,ציר Y",
        limit: 1000,
      },
    });

    res.status(200).json(response.data);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error:", err.message);
    } else {
      console.error("Unknown error:", err);
    }

    res.status(500).json({ error: "Failed to fetch data from external API" });
  }
}
