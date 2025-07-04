import { z } from "zod";

export const FacilitiesQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .nonempty("יש להזין שם עיר")
    .max(50, "עד 50 תווים בלבד")
    .regex(/^[\u0590-\u05FF\s]+$/, "עברית בלבד"),
});
export type FacilitiesQuery = z.infer<typeof FacilitiesQuerySchema>;

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
});

export const FacilitiesApiResponse = z.object({
  result: z.object({
    records: z.array(RawFacilitySchema),
  }),
});
export type FacilitiesApi = z.infer<typeof FacilitiesApiResponse>;
