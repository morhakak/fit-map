import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon" });
  }

  try {
    const response = await axios.get(import.meta.env.VITE_NOMINATIM_API_BASE, {
      params: {
        lat,
        lon,
        format: "json",
        "accept-language": "he",
      },
      headers: {
        "User-Agent": import.meta.env.VITE_OSM_USER_AGENT,
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return res.status(500).json({ error: "Failed to fetch reverse geocode" });
  }
}
