export function SearchConsoleVerification() {
  const token = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  if (!token) {
    return null;
  }

  return <meta name="google-site-verification" content={token} />;
}
