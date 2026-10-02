import { z } from "zod";
import { LATAM_COUNTRIES, NZ_CITIES, VISA_TYPES } from "@/lib/constants";

const visaValues = VISA_TYPES.map((v) => v.value) as [string, ...string[]];

export const profileSchema = z.object({
  display_name: z.string().trim().min(2, "Ingresá tu nombre").max(60),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, "3-20 caracteres: letras minúsculas, números o _"),
  bio: z.string().trim().max(300).optional().or(z.literal("")),
  origin_country: z.enum(LATAM_COUNTRIES, { message: "Elegí tu país" }),
  nz_start_city: z.enum(NZ_CITIES, { message: "Elegí una ciudad" }),
  visa: z.enum(visaValues),
});

export const tripSchema = z
  .object({
    mode: z.enum(["exact", "month"]),
    arrival_date: z.string().optional(), // YYYY-MM-DD
    arrival_month: z.string().optional(), // YYYY-MM
    flight_origin: z.string().trim().max(60).optional().or(z.literal("")),
    flight_number: z.string().trim().max(12).optional().or(z.literal("")),
    notes: z.string().trim().max(300).optional().or(z.literal("")),
    is_public: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.mode === "exact" && !/^\d{4}-\d{2}-\d{2}$/.test(v.arrival_date ?? "")) {
      ctx.addIssue({ code: "custom", path: ["arrival_date"], message: "Elegí una fecha" });
    }
    if (v.mode === "month" && !/^\d{4}-\d{2}$/.test(v.arrival_month ?? "")) {
      ctx.addIssue({ code: "custom", path: ["arrival_month"], message: "Elegí un mes" });
    }
  });

export type ProfileInput = z.infer<typeof profileSchema>;
export type TripInput = z.infer<typeof tripSchema>;
