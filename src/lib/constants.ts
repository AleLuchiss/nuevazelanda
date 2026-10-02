export const LATAM_COUNTRIES = [
  "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Cuba",
  "Ecuador", "El Salvador", "Guatemala", "Honduras", "México", "Nicaragua",
  "Panamá", "Paraguay", "Perú", "República Dominicana", "Uruguay", "Venezuela",
] as const;

export const NZ_CITIES = [
  "Auckland", "Wellington", "Christchurch", "Queenstown", "Hamilton",
  "Tauranga", "Napier / Hastings", "Nelson", "Dunedin", "Otra",
] as const;

export const VISA_TYPES = [
  { value: "working_holiday", label: "Working Holiday" },
  { value: "student", label: "Student" },
  { value: "work", label: "Work" },
  { value: "visitor", label: "Visitor" },
  { value: "otra", label: "Otra" },
] as const;

export const POST_CATEGORIES = [
  { value: "tramites", label: "Trámites iniciales", icon: "FileText" },
  { value: "empleo", label: "Empleo", icon: "Briefcase" },
  { value: "alojamiento", label: "Alojamiento", icon: "Home" },
  { value: "experiencias", label: "Experiencias y consejos", icon: "Mountain" },
] as const;
