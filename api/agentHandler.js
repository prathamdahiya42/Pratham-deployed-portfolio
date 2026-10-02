import fs from 'fs';
import path from 'path';
import { Groq } from 'groq-sdk';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Cache system prompt in memory
let cachedSystemPrompt = null;

function getSystemPrompt() {
  if (cachedSystemPrompt) return cachedSystemPrompt;

  const possiblePaths = [
    path.join(process.cwd(), 'content', 'agent-context.md'),
    path.join(process.cwd(), 'content/agent-context.md'),
    path.resolve('content/agent-context.md'),
    path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../content/agent-context.md'),
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        cachedSystemPrompt = fs.readFileSync(p, 'utf-8');
        return cachedSystemPrompt;
      }
    } catch (_) {}
  }

  return `You are an AI agent embedded in Pratham Dahiya's personal portfolio. You answer visitor questions about Pratham factually, naturally, and helpfully in third person. Pratham Dahiya is a first-year EEE engineering student at UIT RGPV Bhopal and a self-taught developer who builds web apps, AI tools, and content under the House VibeCoders brand.`;
}

// Initialize Upstash Ratelimit if credentials exist
let ratelimit = null;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(8, '1 m'),
      analytics: true,
      prefix: 'portfolio_agent_rl',
    });
  } catch (err) {
    console.warn('Could not initialize Upstash Ratelimit:', err.message);
  }
}

export async function handleAgentRequest(req) {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 1. Rate Limiting Check (8 requests / min / IP)
  const forwarded = req.headers.get ? req.headers.get('x-forwarded-for') : req.headers?.['x-forwarded-for'];
  const realIp = req.headers.get ? req.headers.get('x-real-ip') : req.headers?.['x-real-ip'];
  const ip = (forwarded ? forwarded.split(',')[0].trim() : realIp) || '127.0.0.1';

  if (ratelimit) {
    try {
      const { success, limit, remaining, reset } = await ratelimit.limit(ip);
      if (!success) {
        return new Response(
          JSON.stringify({
            error: "You've reached the question limit (8 per minute). Please wait a moment or reach out directly to Pratham via the contact section below.",
            rateLimited: true,
            limit,
            remaining,
            reset,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': String(remaining),
              'X-RateLimit-Reset': String(reset),
            },
          }
        );
      }
    } catch (rlError) {
      console.warn('Ratelimit check skipped due to error:', rlError.message);
    }
  } else {
    // In-memory fallback rate limiter
    if (!globalThis.__agentRateLimitStore) {
      globalThis.__agentRateLimitStore = new Map();
    }
    const now = Date.now();
    const windowMs = 60 * 1000;
    const records = globalThis.__agentRateLimitStore.get(ip) || [];
    const validRecords = records.filter(t => now - t < windowMs);
    if (validRecords.length >= 8) {
      return new Response(
        JSON.stringify({
          error: "You've reached the question limit (8 per minute). Please wait a moment or reach out directly to Pratham via the contact section below.",
          rateLimited: true,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    validRecords.push(now);
    globalThis.__agentRateLimitStore.set(ip, validRecords);
  }

  // 2. Parse & Validate Body
  let body;
  try {
    if (typeof req.json === 'function') {
      body = await req.json();
    } else if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Reject any single message over ~500 characters
  for (const msg of messages) {
    if (typeof msg.content === 'string' && msg.content.length > 500) {
      return new Response(
        JSON.stringify({
          error: 'Your message exceeds the 500-character limit. Please keep your question concise.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // 4. Truncate incoming message history to the last 8 messages
  const truncatedMessages = messages.slice(-8).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || ''),
  }));

  // 5. Auth & Groq Setup
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'GROQ_API_KEY is not configured on the server. Please check your .env.local.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const groq = new Groq({ apiKey });
  const systemPrompt = getSystemPrompt();

  const conversation = [
    { role: 'system', content: systemPrompt },
    ...truncatedMessages,
  ];

  // Model selection: allow env override, try llama-3.1-8b-instant, fallback to qwen/qwen3.8-27b
  const preferredModel = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

  try {
    const stream = await groq.chat.completions.create({
      model: preferredModel,
      messages: conversation,
      max_tokens: 500,
      stream: true,
      temperature: 0.6,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (streamErr) {
          console.error('Error during token streaming:', streamErr);
          controller.error(streamErr);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (groqErr) {
    console.error('Groq API Error:', groqErr);

    // If preferred model had an issue, attempt fallback
    if (preferredModel !== 'llama-3.1-8b-instant') {
      try {
        const fallbackStream = await groq.chat.completions.create({
          model: 'openai/gpt-oss-20b',
          messages: conversation,
          max_tokens: 500,
          stream: true,
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of fallbackStream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              }
            } catch (err) {
              controller.error(err);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(readable, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
          },
        });
      } catch (_) {}
    }

    return new Response(
      JSON.stringify({
        error: "I'm having a momentary hiccup reaching my brain. Please try asking again in a few seconds, or reach out to Pratham directly via email or social links below!",
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
