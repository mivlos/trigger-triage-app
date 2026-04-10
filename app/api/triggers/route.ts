import { promises as fs } from 'fs';
import { join } from 'path';

interface Trigger {
  id: string;
  name: string;
  score: number;
  audience?: string;
  message?: string;
  platforms?: string[];
  content: string;
}

// Sample trigger data embedded at build time
const SAMPLE_TRIGGERS: Trigger[] = [
  {
    id: '8-5-canva-proprietary-model',
    name: 'Canva Proprietary Design Model',
    score: 8.5,
    audience: 'Creators, Design Professionals',
    message: 'Editable layers, not flat images. Direct threat.',
    platforms: ['blog', 'linkedin'],
    content: 'Canva launched proprietary AI design model...',
  },
  {
    id: '8-5-capcut-seedance-us-launch',
    name: 'CapCut Seedance 2.0 US Launch + 90% Promo',
    score: 8.5,
    audience: 'Video Creators',
    message: 'Direct competition during Sora shutdown.',
    platforms: ['tiktok', 'instagram', 'twitter'],
    content: 'ByteDance officially launched Seedance 2.0 in the US...',
  },
  {
    id: '8-3-meta-muse-spark',
    name: 'Meta Muse Spark — Superintelligence Labs',
    score: 8.3,
    audience: 'All Creators (3B+ users)',
    message: 'Proprietary AI in 3B+ user ecosystem.',
    platforms: ['facebook', 'instagram', 'whatsapp'],
    content: 'Meta launched Muse Spark from Superintelligence Labs...',
  },
  {
    id: '7-8-google-vids-veo-free',
    name: 'Google Vids + Veo 3.1 Free Tier',
    score: 7.8,
    audience: 'Casual Video Creators',
    message: '10 free clips/month for any Google account.',
    platforms: ['youtube', 'blog'],
    content: 'Google launched Vids with free Veo 3.1 access...',
  },
  {
    id: '7-6-ai-clone-agency-boom',
    name: 'AI Clone Agency Boom',
    score: 7.6,
    audience: 'Small Business, Local Video',
    message: '$400K/mo agencies using Seedance + HeyGen.',
    platforms: ['tiktok', 'youtube'],
    content: 'Entrepreneurs building agencies selling AI video clones...',
  },
];

export async function GET() {
  try {
    // Try to load from filesystem (local dev)
    let triggers = SAMPLE_TRIGGERS;
    
    try {
      const triggersDir = join(process.cwd(), '../../gtm/triggers/pending');
      const files = await fs.readdir(triggersDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      if (mdFiles.length > 0) {
        triggers = [];
        for (const file of mdFiles) {
          const path = join(triggersDir, file);
          const content = await fs.readFile(path, 'utf-8');
          
          // Extract score from filename
          const scoreMatch = file.match(/^(\d)-(\d+)-/);
          const score = scoreMatch ? parseFloat(`${scoreMatch[1]}.${scoreMatch[2]}`) : 0;
          
          triggers.push({
            id: file.replace('.md', ''),
            name: file.replace(/^[\d\-]+/, '').replace(/-/g, ' ').replace('.md', ''),
            score,
            audience: 'General',
            message: 'See full content below',
            platforms: [],
            content,
          });
        }
      }
    } catch (fsError) {
      console.log('Using sample triggers (filesystem unavailable on Vercel)');
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
    return Response.json({
      total: SAMPLE_TRIGGERS.length,
      triggers: SAMPLE_TRIGGERS,
      stats: {
        pending: SAMPLE_TRIGGERS.length,
        avgScore: (SAMPLE_TRIGGERS.reduce((sum, t) => sum + t.score, 0) / SAMPLE_TRIGGERS.length).toFixed(1),
        byScore: {
          high: SAMPLE_TRIGGERS.filter(t => t.score >= 8).length,
          medium: SAMPLE_TRIGGERS.filter(t => t.score >= 6 && t.score < 8).length,
          low: SAMPLE_TRIGGERS.filter(t => t.score < 6).length,
        },
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const { triggerId, action } = await request.json();

    if (!['approve', 'reject', 'defer'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log(`Trigger ${triggerId} marked for: ${action}`);
    return Response.json({ success: true, action, triggerId });
  } catch (error) {
    console.error('Error processing trigger:', error);
    return Response.json({ error: 'Failed to process trigger' }, { status: 500 });
  }
}
