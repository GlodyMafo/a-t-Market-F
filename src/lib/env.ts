export const env = {
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/+$/, ""),
  siteName: "A&T Market",
} as const;