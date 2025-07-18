import { z } from "zod";

export const CityQuerySchema = z
  .string()
  .trim()
  .nonempty("יש להזין שם עיר/רשות מקומית")
  .max(50, "עד 50 תווים בלבד")
  .regex(/^[\u0590-\u05FF\s]+$/, "אנא הזן תווים בעברית בלבד ללא ספרות");
export type CityQuery = z.infer<typeof CityQuerySchema>;

export const RawFacilitySchema = z.object({
  _id: z.string(),
  "ציר X": z.string().transform((s) => Number(s)),
  "ציר Y": z.string().transform((s) => Number(s)),
  "שם המתקן": z.string(),
  רחוב: z.string().optional(),
  "מספר בית": z.string().optional(),
  "סוג מתקן": z.string().optional(),
  "משרת בית ספר": z.union([z.string(), z.boolean()]).optional(),
  "פנוי לפעילות": z.string().optional(),
  "נגישות לנכים": z.union([z.string(), z.boolean()]).optional(),
  "מצב המתקן": z.string().optional(),
  "רשות מקומית": z.string().optional(),
});

export const FacilitiesApiResponse = z.object({
  result: z.object({
    records: z.array(RawFacilitySchema),
  }),
});
export type FacilitiesApi = z.infer<typeof FacilitiesApiResponse>;
