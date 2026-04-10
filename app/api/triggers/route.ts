import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const TRIGGERS_DIR = join(process.cwd(), '..', 'gtm', 'triggers', 'pending');

interface Trigger {
  id: string;
  name: string;
  score: number;
  audience?: string;
  message?: string;
  platforms?: string[];
  content: string;
}

async function parseTriggerFile(filename: string, content: string): Promise<Trigger> {
  // Extract frontmatter and content
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const metadata: Record<string, any> = {};

  if (frontmatterMatch) {
    const lines = frontmatterMatch[1].split('\n');
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        // Handle arrays (platforms: [a, b, c])
        if (value.startsWith('[') && value.endsWith(']')) {
          metadata[key.trim()] = value
            .slice(1, -1)
            .split(',')
            .map(v => v.trim());
        } else {
          metadata[key.trim()] = value;
        }
      }
    });
  }

  // Extract score from filename (e.g., "8-5-canva-proprietary-model.md" → 8.5)
  const scoreMatch = filename.match(/^(\d)-(\d+)-/);
  const score = scoreMatch ? parseFloat(`${scoreMatch[1]}.${scoreMatch[2]}`) : 0;

  return {
    id: filename.replace('.md', ''),
    name: metadata.title || filename.replace(/^[\d\-]+/, '').replace(/-/g, ' ').replace('.md', ''),
    score,
    audience: metadata.audience,
    message: metadata.message,
    platforms: metadata.platforms || [],
    content,
  };
}

export async function GET() {
  try {
    const files = await readdir(TRIGGERS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const triggers: Trigger[] = [];

    for (const file of mdFiles) {
      const path = join(TRIGGERS_DIR, file);
      const content = await readFile(path, 'utf-8');
      const trigger = await parseTriggerFile(file, content);
      triggers.push(trigger);
    }

    // Sort by score descending
    triggers.sort((a, b) => b.score - a.score);

    return Response.json({
      total: triggers.length,
      triggers,
      stats: {
        pending: triggers.length,
        avgScore: (triggers.reduce((sum, t) => sum + t.score, 0) / triggers.length).toFixed(1),
        byScore: {
          high: triggers.filter(t => t.score >= 8).length,
          medium: triggers.filter(t => t.score >= 6 && t.score < 8).length,
          low: triggers.filter(t => t.score < 6).length,
        },
      },
    });
  } catch (error) {
    console.error('Error reading triggers:', error);
    return Response.json({ error: 'Failed to load triggers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { triggerId, action } = await request.json();

    if (!['approve', 'reject', 'defer'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Action will be handled by frontend moving files
    // This endpoint is mainly for logging/validation
    console.log(`Trigger ${triggerId} marked for: ${action}`);

    return Response.json({ success: true, action, triggerId });
  } catch (error) {
    console.error('Error processing trigger:', error);
    return Response.json({ error: 'Failed to process trigger' }, { status: 500 });
  }
}
