/**
 * Verifies incoming Vapi workflow webhook requests via a shared secret.
 * Configure VAPI_WEBHOOK_SECRET in env and pass it as:
 *   Authorization: Bearer <secret>  OR  x-api-key: <secret>
 */
export function verifyVapiWebhook(request: Request): boolean {
  const secret = process.env.VAPI_WEBHOOK_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("VAPI_WEBHOOK_SECRET is not configured");
      return false;
    }
    console.warn(
      "VAPI_WEBHOOK_SECRET not set — allowing request in development"
    );
    return true;
  }

  const authHeader = request.headers.get("authorization");
  const apiKey = request.headers.get("x-api-key");

  return authHeader === `Bearer ${secret}` || apiKey === secret;
}
