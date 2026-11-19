const config = {
  schema: "./lib/schema.ts",
  driver: "better-sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "./local.db",
  },
  verbose: true,
  strict: true,
}

export default config
