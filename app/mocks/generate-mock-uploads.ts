import type { Tables } from "~/db.types";

export function generateMockUploads(count: number): Tables<"uploads">[] {
  const extensions = ["pdf", "doc", "docx", "jpg", "png", "xls", "csv", "txt"];
  const statuses = ["uploaded", "processing", "completed"];
  const types = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "text/plain",
    "application/vnd.ms-excel",
  ];

  return Array.from({ length: count }).map((_, i) => ({
    id: crypto.randomUUID(),
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    profile_id: crypto.randomUUID(),
    namespace: crypto.randomUUID(),
    name: `file_${i + 1}.${extensions[i % extensions.length]}`,
    size: Math.floor(Math.random() * 10 * 1024 * 1024), // Random size up to 10MB
    type: types[i % types.length],
    url: `https://example.com/uploads/${crypto.randomUUID()}`,
    metadata:
      i % 4 === 0
        ? {
            pages: Math.floor(Math.random() * 100) + 1,
            author: `user${i % 10}`,
          }
        : null,
    status: statuses[i % statuses.length],
    updated_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  }));
}
