namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string | undefined;
    NEXT_PUBLIC_SUPABASE_URL: string | undefined;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string | undefined;
    SERVICE_ROLE_KEY: string | undefined;
    DB_PASSWORD: string | undefined;
    NEXT_PUBLIC_SITE_URL: string | undefined;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string | undefined;
    STRIPE_SECRET_KEY: string | undefined;
    STRIPE_WEBHOOK_SECRET: string | undefined;
  }
}
