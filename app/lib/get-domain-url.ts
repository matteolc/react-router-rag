export function getDomainUrl(request: Request): string | null {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("Host");
  if (!host) return null;

  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
