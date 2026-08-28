#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

async function readLocalEnvironment() {
  try {
    const contents = await readFile(path.resolve(".env.local"), "utf8");

    return Object.fromEntries(
      contents.split(/\r?\n/).flatMap((line) => {
        const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
        return match
          ? [[match[1], match[2].replace(/^['"]|['"]$/g, "")]]
          : [];
      }),
    );
  } catch {
    return {};
  }
}

const filePath = process.argv[2];

if (!filePath) {
  throw new Error(
    "Usage: node scripts/push-ingest.mjs /absolute/path/to/payload.json",
  );
}

const savedEnvironment = await readLocalEnvironment();
const baseUrl =
  process.env.TRACKER_URL ||
  savedEnvironment.TRACKER_URL ||
  "http://localhost:3000";
const token =
  process.env.TRACKER_INGEST_TOKEN ||
  savedEnvironment.TRACKER_INGEST_TOKEN ||
  "";
const siteAccessToken =
  process.env.SITES_ACCESS_TOKEN ||
  savedEnvironment.SITES_ACCESS_TOKEN ||
  "";
const payload = JSON.parse(await readFile(path.resolve(filePath), "utf8"));

const response = await fetch(new URL("/api/ingest", baseUrl), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(siteAccessToken
      ? { "OAI-Sites-Authorization": `Bearer ${siteAccessToken}` }
      : {}),
  },
  body: JSON.stringify(payload),
});
const result = await response.json();

if (!response.ok) {
  throw new Error(
    `Ingestion failed (${response.status}): ${result.error || "Unknown error"}`,
  );
}

console.log(JSON.stringify(result));
