import fs from "node:fs/promises";
import path from "node:path";

const API_BASE_URL = "https://api.browse.ai/v2";
const ROBOT_ID = "019d6023-c044-7c4c-b995-5d0dac1c141c";
const DEFAULT_INPUTS = {
  imdb_url: "https://www.imdb.com/calendar/",
  upcoming_releases_max: 10,
};
const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "src/data/upcoming-releases.json"
);
const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 24;

async function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");

  try {
    const raw = await fs.readFile(envPath, "utf8");
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [key, ...rest] = trimmed.split("=");
      const value = rest.join("=").trim().replace(/^['"]|['"]$/g, "");

      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing env file.
  }
}

await loadLocalEnv();

const API_KEY =
  process.env.BROWSE_AI_API_KEY || process.env.BROWSEAI_API_KEY || process.env.BROWSE_API_KEY;

if (!API_KEY) {
  console.error("Missing BROWSE_AI_API_KEY");
  process.exit(1);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseReleaseDate(value) {
  if (!value) return "";

  const cleaned = String(value).trim();
  const parsed = new Date(cleaned);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  const slashMatch = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month}-${day}`;
  }

  return cleaned;
}

function extractImage(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    return (
      value.url ||
      value.src ||
      value.image ||
      value.poster ||
      value.posterImage ||
      ""
    );
  }
  return "";
}

function getFieldValue(item, candidates) {
  const keys = Object.keys(item ?? {});
  for (const candidate of candidates) {
    const match = keys.find((key) => key.toLowerCase() === candidate.toLowerCase());
    if (match && item[match] != null && item[match] !== "") {
      return item[match];
    }
  }

  for (const candidate of candidates) {
    const match = keys.find((key) => key.toLowerCase().includes(candidate.toLowerCase()));
    if (match && item[match] != null && item[match] !== "") {
      return item[match];
    }
  }

  return "";
}

function collectArraysDeep(value, acc = []) {
  if (Array.isArray(value)) {
    acc.push(value);
    for (const item of value) {
      collectArraysDeep(item, acc);
    }
    return acc;
  }

  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) {
      collectArraysDeep(nested, acc);
    }
  }

  return acc;
}

function scoreMovieArray(items) {
  if (!Array.isArray(items) || items.length === 0) return -1;

  return items.reduce((score, item) => {
    if (!item || typeof item !== "object") return score;

    const title = getFieldValue(item, ["title", "movie title", "name"]);
    const image = extractImage(
      getFieldValue(item, ["poster image", "poster", "image", "poster url"])
    );
    const releaseDate = getFieldValue(item, ["release date", "date", "release"]);

    let rowScore = 0;
    if (title) rowScore += 3;
    if (image) rowScore += 3;
    if (releaseDate) rowScore += 2;
    return score + rowScore;
  }, 0);
}

function normalizeMoviesFromTask(taskResult) {
  const arrays = collectArraysDeep(taskResult?.capturedTexts ?? {});
  const bestArray = [...arrays].sort((a, b) => scoreMovieArray(b) - scoreMovieArray(a))[0] ?? [];

  const normalized = bestArray
    .map((item, index) => {
      const title = getFieldValue(item, ["title", "movie title", "name"]);
      const releaseDate = parseReleaseDate(
        getFieldValue(item, ["release date", "date", "release"])
      );
      const image = extractImage(
        getFieldValue(item, ["poster image", "poster", "image", "poster url"])
      );
      const overview = getFieldValue(item, ["overview", "summary", "description"]);

      if (!title || !image || !releaseDate) {
        return null;
      }

      return {
        id: slugify(`${title}-${releaseDate}-${index}`),
        title: String(title).trim(),
        releaseDate,
        image,
        overview: String(overview || "").trim(),
      };
    })
    .filter(Boolean);

  return normalized;
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Browse AI request failed with status ${response.status}`);
  }

  return response.json();
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getLatestSuccessfulTask() {
  const payload = await apiRequest(`/robots/${ROBOT_ID}/tasks`);
  const items =
    payload?.result?.robotTasks?.items ||
    payload?.result?.items ||
    payload?.result ||
    [];

  return items.find((task) => task?.status === "successful") ?? null;
}

async function getTaskDetails(taskId) {
  const payload = await apiRequest(`/robots/${ROBOT_ID}/tasks/${taskId}`);
  return payload?.result ?? null;
}

async function runTask() {
  const payload = await apiRequest(`/robots/${ROBOT_ID}/tasks`, {
    method: "POST",
    body: JSON.stringify({
      inputParameters: DEFAULT_INPUTS,
    }),
  });

  return payload?.result ?? null;
}

async function main() {
  let task = await getLatestSuccessfulTask();

  if (!task) {
    task = await runTask();
  } else {
    const finishedAt = Number(task.finishedAt || 0);
    const twelveHoursAgo = Date.now() - 1000 * 60 * 60 * 12;

    if (!finishedAt || finishedAt < twelveHoursAgo) {
      task = await runTask();
    }
  }

  let taskResult = task?.id ? await getTaskDetails(task.id) : null;

  if (taskResult?.status && taskResult.status !== "successful") {
    for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
      await sleep(POLL_INTERVAL_MS);
      taskResult = await getTaskDetails(task.id);

      if (taskResult?.status === "successful") {
        break;
      }

      if (taskResult?.status === "failed") {
        throw new Error("Browse AI task failed.");
      }
    }
  }

  if (!taskResult || taskResult.status !== "successful") {
    throw new Error("Browse AI task did not complete successfully.");
  }

  const results = normalizeMoviesFromTask(taskResult);

  if (!results.length) {
    throw new Error("Could not extract movie data from Browse AI task result.");
  }

  const normalized = {
    source: "browse-ai-robot",
    syncedAt: new Date().toISOString(),
    results,
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  console.log(
    `Browse AI upcoming sync complete: ${normalized.results.length} movies written to ${OUTPUT_PATH}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
