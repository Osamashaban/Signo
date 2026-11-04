import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. See .env.example.`);
  }
  return value;
}

// Server-only secrets. Importing this file from a client component fails the build.
export const serverEnv = {
  databaseUrl: () => required("DATABASE_URL"),
  resendApiKey: () => required("RESEND_API_KEY"),
  reviewLinkEncryptionKey: () => required("REVIEW_LINK_ENCRYPTION_KEY"),
  emailFrom: () => required("EMAIL_FROM"),
};
