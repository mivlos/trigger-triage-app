import fs from "fs";
import path from "path";

const WORKSPACE = process.env.WORKSPACE_PATH || path.join(process.cwd(), "data", "triggers");

export interface Trigger {
  id: string;
  filename: string;
  name: string;
  type: string;
  detected: string;
  source: string;
  halfLife: string;
  score: number;
  velocity: number;
  relevance: number;
  halfLifeScore: number;
  signal: string;
  whyItMatters: string;
  recommendedAction: string;
  audiences: string[];
  platforms: string[];
  competitiveContext: string;
  relatedTriggers: string[];
  status: "pending" | "approved" | "rejected";
  rawContent: string;
}

function extractField(content: string, field: string): string {
  const sectionRegex = new RegExp(`## ${field}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "i");
  const sectionMatch = content.match(sectionRegex);
  if (sectionMatch) return sectionMatch[1].trim();

  const boldRegex = new RegExp(`\\*\\*${field}[:\\*]*\\*\\*\\s*(.+)`, "i");
  const boldMatch = content.match(boldRegex);
  if (boldMatch) return boldMatch[1].trim();

  return "";
}

function extractScore(content: string): number {
  const scoreMatch = content.match(/\*\*Score:\*\*\s*([\d.]+)\s*\/\s*10/i)
    || content.match(/\*\*Overall:\*\*\s*([\d.]+)\s*\/\s*10/i);
  return scoreMatch ? parseFloat(scoreMatch[1]) : 0;
}

function extractSubScore(content: string, field: string): number {
  const regex = new RegExp(`\\*\\*${field}:\\*\\*\\s*([\\d.]+)\\s*/\\s*10`, "i");
  const match = content.match(regex);
  return match ? parseFloat(match[1]) : 0;
}

function extractName(content: string, filename: string): string {
  const titleMatch = content.match(/^#\s+(?:Trigger:\s*)?(.+)/m);
  if (titleMatch) return titleMatch[1].trim();
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/\.md$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractType(content: string): string {
  const typeMatch = content.match(/\*\*Type:\*\*\s*(.+)/i);
  return typeMatch ? typeMatch[1].trim() : "Unknown";
}

function extractDetected(content: string): string {
  const match = content.match(/\*\*Detected:\*\*\s*(.+)/i);
  return match ? match[1].trim() : "";
}

function extractSource(content: string): string {
  const match = content.match(/\*\*Source:\*\*\s*(.+)/i);
  return match ? match[1].trim() : "";
}

function extractHalfLife(content: string): string {
  const match = content.match(/\*\*Half-life:\*\*\s*(.+)/i);
  return match ? match[1].trim() : "";
}

function extractPlatforms(content: string): string[] {
  const platforms: string[] = [];
  const platformKeywords = ["TikTok", "Instagram", "X", "Twitter", "LinkedIn", "YouTube", "Reddit", "Threads", "Facebook", "Snapchat", "CapCut"];
  for (const p of platformKeywords) {
    if (content.toLowerCase().includes(p.toLowerCase())) {
      platforms.push(p === "Twitter" ? "X" : p);
    }
  }
  return [...new Set(platforms)];
}

function extractAudiences(content: string): string[] {
  const audiences: string[] = [];
  const audienceKeywords = [
    "creators", "designers", "developers", "marketers", "enterprises",
    "prosumers", "gen-z", "professionals", "small business", "agencies",
    "content creators", "video creators", "photographers"
  ];
  for (const a of audienceKeywords) {
    if (content.toLowerCase().includes(a)) {
      audiences.push(a.replace(/\b\w/g, (c) => c.toUpperCase()));
    }
  }
  return audiences.length > 0 ? [...new Set(audiences)] : ["General"];
}

function extractRelatedTriggers(content: string): string[] {
  const matches = content.match(/`([^`]+\.md)`/g);
  return matches ? matches.map((m) => m.replace(/`/g, "")) : [];
}

function parseTriggerFile(filepath: string, status: "pending" | "approved" | "rejected"): Trigger {
  const raw = fs.readFileSync(filepath, "utf-8");
  const filename = path.basename(filepath);

  return {
    id: filename.replace(/\.md$/, ""),
    filename,
    name: extractName(raw, filename),
    type: extractType(raw),
    detected: extractDetected(raw),
    source: extractSource(raw),
    halfLife: extractHalfLife(raw),
    score: extractScore(raw),
    velocity: extractSubScore(raw, "Velocity"),
    relevance: extractSubScore(raw, "Relevance"),
    halfLifeScore: extractSubScore(raw, "Half-life"),
    signal: extractField(raw, "Signal"),
    whyItMatters: extractField(raw, "Why It Matters for Picsart") || extractField(raw, "Why It Matters"),
    recommendedAction: extractField(raw, "Recommended Response") || extractField(raw, "Recommended Action"),
    audiences: extractAudiences(raw),
    platforms: extractPlatforms(raw),
    competitiveContext: extractField(raw, "Competitive Context") || "",
    relatedTriggers: extractRelatedTriggers(raw),
    status,
    rawContent: raw,
  };
}

export function loadTriggers(status?: "pending" | "approved" | "rejected"): Trigger[] {
  const statuses = status ? [status] : (["pending", "approved", "rejected"] as const);
  const triggers: Trigger[] = [];

  for (const s of statuses) {
    const dir = path.join(WORKSPACE, s);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      try {
        triggers.push(parseTriggerFile(path.join(dir, file), s));
      } catch (e) {
        console.error(`Failed to parse ${file}:`, e);
      }
    }
  }

  return triggers.sort((a, b) => b.score - a.score);
}

export function moveTrigger(filename: string, from: string, to: string): boolean {
  const fromPath = path.join(WORKSPACE, from, filename);
  const toDir = path.join(WORKSPACE, to);
  const toPath = path.join(toDir, filename);

  if (!fs.existsSync(fromPath)) return false;
  if (!fs.existsSync(toDir)) fs.mkdirSync(toDir, { recursive: true });

  fs.renameSync(fromPath, toPath);
  return true;
}
