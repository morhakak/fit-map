import { FacilitiesApiResponse } from "@/schemas/facilities";
import type { Facility } from "@/types/facility";
import { devLog } from "@/utils/logger";
import { fromITMtoWGS84 } from "@/utils/projection";
import axios from "axios";

export const fetchFacilities = async (city: string): Promise<Facility[]> => {
  let rawData: unknown;
  try {
    const response = await axios.get("/api/facilities", {
      params: { q: city },
    });
    rawData = response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        switch (err.response.status) {
          case 403:
            throw new Error("אין לך הרשאה לגשת למתקנים האלה");
          case 404:
            throw new Error("לא נמצאו מתקנים ברשות המקומית שהזנת");
          default:
            throw new Error(`שגיאת שרת: ${err.response.status}`);
        }
      }
      if (err.request) {
        throw new Error("שגיאה ברשת: אנא בדוק/י את חיבור האינטרנט ונסה/י שוב");
      }
    }
    throw new Error(
      "אופס! נראה שיש לנו בעיה בקבלת הנתונים כרגע אנא נסה/נסי שוב מאוחר יותר."
    );
  }
  devLog("API response:", rawData);

  const parsed = FacilitiesApiResponse.safeParse(rawData);
  if (!parsed.success) {
    devLog("Bad API shape:", parsed.error.message);
    throw new Error("שגיאת נתונים מהשרת");
  }

  return parsed.data.result.records
    .filter((f) => f["רשות מקומית"] === city)
    .map((f) => {
      const { lat, lng } = fromITMtoWGS84(f["ציר X"], f["ציר Y"]);
      return {
        id: Number(f._id),
        name: f["שם המתקן"],
        lat,
        lng,
        street: f.רחוב,
        houseNumber: f["מספר בית"],
        type: f["סוג מתקן"],
        schoolServed: Boolean(f["משרת בית ספר"]),
        availability: f["פנוי לפעילות"],
        accessibility: Boolean(f["נגישות לנכים"]),
        status: f["מצב המתקן"],
      };
    });
};
