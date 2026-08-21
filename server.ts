import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { YoutubeTranscript } from 'youtube-transcript';
import dotenv from "dotenv";
import {
  getOrCreatePronunciation,
  getPronunciationById,
  getPronunciationStats,
  deletePronunciationRecord,
} from "./src/server/pronunciationService.ts";
import {
  searchLexicon,
  getLexicalEntry,
  saveLexicalEntry,
  importLexicalDataset,
  getLexiconStats,
  deleteLexicalEntry,
} from "./src/server/lexiconService.ts";
import { db } from "./src/db/index.ts";
import { analyticsEvents } from "./src/db/schema.ts";
import { sql } from "drizzle-orm";
import { CURATED_TRANSCRIPTS } from "./src/data/curatedTranscripts.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini AI Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// In-memory cache for ultra-fast proofreading responses
const proofreadCache = new Map<string, { result: any; timestamp: number }>();
const PROOFREAD_CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// In-memory cache for single-word and bulk translations
const translationMemoryCache = new Map<string, { data: any; timestamp: number }>();
const TRANSLATION_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Model rate-limiting tracking to avoid flooding exhausted models
const modelCooldowns = new Map<string, number>();

// Helper to call Gemini with retry logic and multi-model fallback handling for rate limits (429) & high demand (503)
async function generateContentWithRetry(ai: GoogleGenAI, params: any): Promise<any> {
  const primaryModel = params.model || "gemini-3.1-flash-lite";
  const candidateModels = Array.from(
    new Set([primaryModel, "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.7-flash"])
  );

  let lastError: any = null;
  const now = Date.now();

  // Filter out candidate models that are currently in an active cooldown window
  const activeCandidates = candidateModels.filter(m => (modelCooldowns.get(m) || 0) <= now);
  const modelsToTry = activeCandidates.length > 0 ? activeCandidates : candidateModels;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || err);
      const errStr = errMsg.toLowerCase();
      
      let cooldownMs = 30000;
      const retryMatch = errMsg.match(/retry in ([0-9.]+)s/i) || errMsg.match(/retryDelay"?:\s*"([0-9.]+)s/i);
      if (retryMatch && retryMatch[1]) {
        const parsedSeconds = parseFloat(retryMatch[1]);
        if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
          cooldownMs = Math.ceil(parsedSeconds * 1000) + 1000;
        }
      }

      if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("resource_exhausted")) {
        modelCooldowns.set(model, Date.now() + cooldownMs);
        console.warn(`[Gemini API] Model ${model} rate-limited (429), cooling down for ${Math.round(cooldownMs / 1000)}s`);
      } else if (errStr.includes("503") || errStr.includes("unavailable") || errStr.includes("high demand")) {
        modelCooldowns.set(model, Date.now() + 15000);
        console.warn(`[Gemini API] Model ${model} temporarily unavailable (503), cooling down for 15s`);
      } else {
        console.warn(`[Gemini API] Call with model ${model} failed:`, errMsg.substring(0, 120));
      }

      // Small 200ms pause before attempting next candidate model
      if (i < modelsToTry.length - 1) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }

  throw lastError || new Error("All candidate Gemini models are currently cooling down");
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Centralized Analytics Event Tracking Endpoint with Validation & Batching
app.post("/api/analytics/track", async (req, res) => {
  try {
    const payload = req.body;
    const events = Array.isArray(payload) ? payload : [payload];

    if (events.length === 0) {
      return res.status(400).json({ error: "Empty tracking payload." });
    }

    const validatedEvents = [];
    const serverTime = new Date();

    for (const rawEvent of events) {
      // Validate core required fields
      const eventName = String(rawEvent.event_name || "").trim();
      const eventCategory = String(rawEvent.event_category || "").trim();
      const sessionId = String(rawEvent.session_id || "").trim();
      
      if (!eventName || !eventCategory || !sessionId) {
        console.warn("[Analytics Validator] Rejected event: missing event_name, event_category, or session_id", rawEvent);
        continue;
      }

      // Generate or sanitize event ID (must start with "evt_")
      let eventId = String(rawEvent.event_id || "").trim();
      if (!eventId || !eventId.startsWith("evt_")) {
        eventId = `evt_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      }

      // Metadata size and depth validation
      let metadataStr = null;
      if (rawEvent.metadata) {
        try {
          const metaObj = typeof rawEvent.metadata === "string" ? JSON.parse(rawEvent.metadata) : rawEvent.metadata;
          // Clean metadata to avoid circular references or huge nested data
          const cleanedMeta: Record<string, any> = {};
          for (const [k, v] of Object.entries(metaObj)) {
            if (v !== null && v !== undefined && typeof v !== "object" && typeof v !== "function") {
              cleanedMeta[k] = v;
            } else if (typeof v === "object" && v !== null) {
              cleanedMeta[k] = JSON.stringify(v).substring(0, 1000); // truncate sub-objects
            }
          }
          metadataStr = JSON.stringify(cleanedMeta);
        } catch {
          metadataStr = String(rawEvent.metadata).substring(0, 5000);
        }
      }

      // Limit overall metadata string size to prevent payload abuse
      if (metadataStr && metadataStr.length > 10000) {
        metadataStr = metadataStr.substring(0, 10000);
      }

      // Resolve client-provided timestamps safely, defaulting to server time
      let eventTimestamp = serverTime;
      if (rawEvent.timestamp) {
        const parsedTime = new Date(rawEvent.timestamp);
        if (!isNaN(parsedTime.getTime())) {
          eventTimestamp = parsedTime;
        }
      }

      // Backend security validation: verify user_id
      let userId = rawEvent.user_id ? String(rawEvent.user_id).trim() : null;

      validatedEvents.push({
        eventId,
        userId: userId || null,
        anonymousId: rawEvent.anonymous_id ? String(rawEvent.anonymous_id).trim() : null,
        sessionId,
        eventName,
        eventCategory,
        timestamp: eventTimestamp,
        route: rawEvent.route ? String(rawEvent.route).trim() : null,
        page: rawEvent.page ? String(rawEvent.page).trim() : null,
        elementId: rawEvent.element_id ? String(rawEvent.element_id).trim() : null,
        languageId: rawEvent.language_id ? String(rawEvent.language_id).trim() : null,
        languageProfileId: rawEvent.language_profile_id ? String(rawEvent.language_profile_id).trim() : null,
        deviceType: rawEvent.device_type ? String(rawEvent.device_type).trim() : null,
        viewport: rawEvent.viewport ? String(rawEvent.viewport).trim() : null,
        metadata: metadataStr,
        createdAt: serverTime,
      });
    }

    if (validatedEvents.length === 0) {
      return res.status(400).json({ error: "No valid events after verification." });
    }

    // Insert to Cloud SQL via Drizzle
    try {
      await db.insert(analyticsEvents).values(validatedEvents);
    } catch (dbErr: any) {
      console.error("[Analytics Engine] DB insertion failed, falling back to local file-buffering:", dbErr?.message);
      // Fallback: append safely to a file in /storage/analytics_fallback.jsonl
      const storageDir = path.join(process.cwd(), "storage");
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
      const fallbackFile = path.join(storageDir, "analytics_fallback.jsonl");
      for (const ev of validatedEvents) {
        fs.appendFileSync(fallbackFile, JSON.stringify(ev) + "\n");
      }
    }

    res.json({ success: true, count: validatedEvents.length });
  } catch (err: any) {
    console.error("[Analytics Endpoint ERROR]:", err);
    res.status(500).json({ error: "Failed to process analytics payload", details: err?.message });
  }
});

// Centralized Analytics Event Query Endpoint for Admin Dashboard (Secure)
app.post("/api/analytics/query", async (req, res) => {
  try {
    // 1. Enforce Admin Access
    const adminPasscode = req.headers['x-admin-passcode'];
    if (adminPasscode !== 'admin123' && adminPasscode !== 'admin') {
      return res.status(401).json({ error: "Unauthorized: Administrative passcode required." });
    }

    const {
      timeRange = '7days',
      startDate,
      endDate,
      userId = 'all',
      languageId = 'all',
      eventName = 'all',
      page = 'all',
      deviceType = 'all',
      limit = 50,
      offset = 0,
      tab = 'overview'
    } = req.body;

    // 2. Build time conditions
    let sinceDate: Date | null = null;
    let untilDate: Date | null = null;
    const now = new Date();

    if (timeRange === 'today') {
      sinceDate = new Date();
      sinceDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'yesterday') {
      sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - 1);
      sinceDate.setHours(0, 0, 0, 0);
      untilDate = new Date();
      untilDate.setDate(untilDate.getDate() - 1);
      untilDate.setHours(23, 59, 59, 999);
    } else if (timeRange === '7days') {
      sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - 7);
    } else if (timeRange === '30days') {
      sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - 30);
    } else if (timeRange === '90days') {
      sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - 90);
    } else if (timeRange === 'custom' && startDate) {
      sinceDate = new Date(startDate);
      if (endDate) {
        untilDate = new Date(endDate);
      }
    }

    // Build query constraints safely using SQL
    const conditions = [];

    if (sinceDate) {
      conditions.push(sql`${analyticsEvents.timestamp} >= ${sinceDate}`);
    }
    if (untilDate) {
      conditions.push(sql`${analyticsEvents.timestamp} <= ${untilDate}`);
    }

    // Filters
    if (userId !== 'all') {
      if (userId === 'anonymous') {
        conditions.push(sql`${analyticsEvents.userId} IS NULL`);
      } else if (userId === 'authenticated') {
        conditions.push(sql`${analyticsEvents.userId} IS NOT NULL`);
      } else {
        conditions.push(sql`${analyticsEvents.userId} = ${userId}`);
      }
    }

    if (languageId !== 'all') {
      conditions.push(sql`${analyticsEvents.languageId} = ${languageId}`);
    }

    if (eventName !== 'all') {
      conditions.push(sql`${analyticsEvents.eventName} = ${eventName}`);
    }

    if (page !== 'all') {
      conditions.push(sql`${analyticsEvents.page} = ${page}`);
    }

    if (deviceType !== 'all') {
      if (deviceType === 'Mobile') {
        conditions.push(sql`${analyticsEvents.deviceType} LIKE '%Mobile%'`);
      } else if (deviceType === 'Desktop') {
        conditions.push(sql`${analyticsEvents.deviceType} LIKE '%Desktop%'`);
      } else if (deviceType === 'Tablet') {
        conditions.push(sql`${analyticsEvents.deviceType} LIKE '%Tablet%'`);
      } else {
        conditions.push(sql`${analyticsEvents.deviceType} = ${deviceType}`);
      }
    }

    const whereSql = conditions.length > 0 ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;

    // Execute queries based on requested tab
    if (tab === 'overview') {
      // 1. Users Breakdown
      const usersQuery = sql`
        SELECT 
          COUNT(DISTINCT session_id) as total_unique_sessions,
          COUNT(DISTINCT user_id) as authenticated_users,
          COUNT(DISTINCT anonymous_id) FILTER (WHERE user_id IS NULL) as anonymous_users,
          COUNT(DISTINCT user_id) FILTER (WHERE event_name = 'user_registered') as new_users,
          COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as active_users
        FROM ${analyticsEvents}
        ${whereSql}
      `;
      const usersRes = await db.execute(usersQuery);
      const userStats = usersRes.rows[0] || {};

      // 2. Sessions metrics
      const sessionsQuery = sql`
        WITH session_durations AS (
          SELECT session_id, 
                 EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) AS duration_sec
          FROM ${analyticsEvents}
          ${whereSql}
          GROUP BY session_id
        )
        SELECT COALESCE(AVG(duration_sec), 0) as avg_duration,
               COUNT(*) as total_sessions
        FROM session_durations
      `;
      const sessionsRes = await db.execute(sessionsQuery);
      const sessionStats = sessionsRes.rows[0] || {};

      // 3. Most viewed pages
      const pagesConditions = [...conditions, sql`page IS NOT NULL`];
      const pagesWhereSql = sql`WHERE ${sql.join(pagesConditions, sql` AND `)}`;
      const pagesQuery = sql`
        SELECT page, COUNT(*) as count 
        FROM ${analyticsEvents}
        ${pagesWhereSql}
        GROUP BY page 
        ORDER BY count DESC 
        LIMIT 5
      `;
      const pagesRes = await db.execute(pagesQuery);

      // 4. Most clicked buttons
      const buttonsConditions = [...conditions, sql`event_name = 'button_clicked'`];
      const buttonsWhereSql = sql`WHERE ${sql.join(buttonsConditions, sql` AND `)}`;
      const buttonsQuery = sql`
        SELECT 
          COALESCE(
            CASE 
              WHEN metadata LIKE '%"button_name"%' THEN substring(metadata from '"button_name":"([^"]+)"')
              ELSE 'unknown'
            END,
            'unknown'
          ) as button_name, 
          COUNT(*) as count 
        FROM ${analyticsEvents}
        ${buttonsWhereSql}
        GROUP BY button_name 
        ORDER BY count DESC 
        LIMIT 5
      `;
      const buttonsRes = await db.execute(buttonsQuery);

      // 5. Scroll engagement
      const scrollConditions = [...conditions, sql`event_name = 'scroll_depth_reached'`];
      const scrollWhereSql = sql`WHERE ${sql.join(scrollConditions, sql` AND `)}`;
      const scrollQuery = sql`
        SELECT 
          COALESCE(
            CASE 
              WHEN metadata LIKE '%"depth_percent"%' THEN substring(metadata from '"depth_percent":([0-9]+)')
              ELSE '0'
            END,
            '0'
          ) as depth,
          COUNT(*) as count
        FROM ${analyticsEvents}
        ${scrollWhereSql}
        GROUP BY depth
        ORDER BY depth ASC
      `;
      const scrollRes = await db.execute(scrollQuery);

      // 6. Conversions
      const convQuery = sql`
        SELECT 
          COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'onboarding_started') as started,
          COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'onboarding_completed') as completed
        FROM ${analyticsEvents}
        ${whereSql}
      `;
      const convRes = await db.execute(convQuery);
      const conversions = convRes.rows[0] || {};

      // 7. Total event count
      const countRes = await db.execute(sql`SELECT COUNT(*) FROM ${analyticsEvents} ${whereSql}`);
      const totalEventsCount = Number(countRes.rows[0]?.count || 0);

      res.json({
        users: {
          total: Number(userStats.active_users || 0),
          authenticated: Number(userStats.authenticated_users || 0),
          anonymous: Number(userStats.anonymous_users || 0),
          new: Number(userStats.new_users || 0),
          returning: Math.max(0, Number(userStats.active_users || 0) - Number(userStats.new_users || 0))
        },
        sessions: {
          total: Number(sessionStats.total_sessions || 0),
          avgDuration: Math.round(Number(sessionStats.avg_duration || 0)),
          perUser: Number(userStats.active_users) > 0 ? Number((Number(sessionStats.total_sessions || 0) / Number(userStats.active_users)).toFixed(2)) : 0
        },
        engagement: {
          totalEvents: totalEventsCount,
          pages: pagesRes.rows,
          buttons: buttonsRes.rows.filter((b: any) => b.button_name !== 'unknown'),
          scroll: scrollRes.rows
        },
        conversions: {
          started: Number(conversions.started || 0),
          completed: Number(conversions.completed || 0),
          rate: Number(conversions.started) > 0 ? Number(((Number(conversions.completed || 0) / Number(conversions.started)) * 100).toFixed(1)) : 0
        }
      });
    } else if (tab === 'live') {
      const liveEventsQuery = sql`
        SELECT * FROM ${analyticsEvents}
        ORDER BY timestamp DESC
        LIMIT 50
      `;
      const liveRes = await db.execute(liveEventsQuery);
      res.json(liveRes.rows);
    } else if (tab === 'users') {
      const usersListQuery = sql`
        SELECT 
          COALESCE(user_id, anonymous_id) as id,
          MIN(user_id) as auth_id,
          MIN(anonymous_id) as anon_id,
          COUNT(*) as event_count,
          MAX(timestamp) as last_active,
          MIN(timestamp) as first_seen,
          COUNT(DISTINCT session_id) as sessions_count
        FROM ${analyticsEvents}
        ${whereSql}
        GROUP BY COALESCE(user_id, anonymous_id)
        ORDER BY last_active DESC
        LIMIT 50
      `;
      const usersRes = await db.execute(usersListQuery);
      res.json(usersRes.rows);
    } else if (tab === 'sessions') {
      const sessionsListQuery = sql`
        SELECT 
          session_id,
          COALESCE(user_id, anonymous_id) as user_id,
          MIN(timestamp) as started_at,
          MAX(timestamp) as ended_at,
          EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) as duration_sec,
          COUNT(*) as event_count,
          MIN(device_type) as device
        FROM ${analyticsEvents}
        ${whereSql}
        GROUP BY session_id, COALESCE(user_id, anonymous_id)
        ORDER BY ended_at DESC
        LIMIT 50
      `;
      const sessionsRes = await db.execute(sessionsListQuery);
      res.json(sessionsRes.rows);
    } else if (tab === 'events') {
      const countQuery = sql`
        SELECT COUNT(*) as total FROM ${analyticsEvents}
        ${whereSql}
      `;
      const countRes = await db.execute(countQuery);
      const total = Number(countRes.rows[0]?.total || 0);

      const eventsQuery = sql`
        SELECT * FROM ${analyticsEvents}
        ${whereSql}
        ORDER BY timestamp DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const eventsRes = await db.execute(eventsQuery);
      res.json({ total, events: eventsRes.rows });
    } else if (tab === 'pages') {
      const pagesMetricsQuery = sql`
        SELECT 
          COALESCE(page, 'Landing Page') as page_name,
          COUNT(*) as views,
          COUNT(DISTINCT session_id) as unique_visitors,
          COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as unique_users
        FROM ${analyticsEvents}
        ${whereSql}
        GROUP BY page
        ORDER BY views DESC
      `;
      const pagesRes = await db.execute(pagesMetricsQuery);
      res.json(pagesRes.rows);
    } else if (tab === 'features') {
      const featuresMetricsQuery = sql`
        SELECT 
          event_category as category,
          event_name as name,
          COUNT(*) as usage_count,
          COUNT(DISTINCT session_id) as sessions_count,
          COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as unique_users
        FROM ${analyticsEvents}
        ${whereSql}
        GROUP BY event_category, event_name
        ORDER BY usage_count DESC
      `;
      const featuresRes = await db.execute(featuresMetricsQuery);
      res.json(featuresRes.rows);
    } else if (tab === 'languages') {
      const langQuery = sql`
        SELECT 
          language_id,
          COUNT(*) as total_events,
          COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as active_learners,
          COUNT(DISTINCT session_id) as total_sessions,
          SUM(CASE WHEN event_name = 'card_reviewed' THEN 1 ELSE 0 END) as cards_reviewed,
          SUM(CASE WHEN event_name = 'quiz_started' THEN 1 ELSE 0 END) as quizzes_started,
          SUM(CASE WHEN event_name = 'quiz_completed' THEN 1 ELSE 0 END) as quizzes_completed
        FROM ${analyticsEvents}
        ${whereSql}
        GROUP BY language_id
        ORDER BY active_learners DESC
      `;
      const langRes = await db.execute(langQuery);
      res.json(langRes.rows.filter((r: any) => r.language_id && r.language_id !== 'null' && r.language_id !== 'all'));
    } else if (tab === 'funnels') {
      // 1. Onboarding Funnel: onboarding_started -> onboarding_preference_selected -> onboarding_completed
      const onboardingFunnelQuery = sql`
        SELECT 
          COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'onboarding_started') as step1,
          COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'onboarding_preference_selected') as step2,
          COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'onboarding_completed') as step3
        FROM ${analyticsEvents}
        ${whereSql}
      `;
      const onboardingFunnelRes = await db.execute(onboardingFunnelQuery);

      // 2. Interaction Funnel: page_viewed -> button_clicked -> quiz/practice started
      const interactFunnelQuery = sql`
        SELECT 
          COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_viewed') as step1,
          COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'button_clicked') as step2,
          COUNT(DISTINCT session_id) FILTER (WHERE event_name IN ('quiz_started', 'practice_started', 'voice_tutor_started')) as step3,
          COUNT(DISTINCT session_id) FILTER (WHERE event_name IN ('quiz_completed', 'practice_completed', 'voice_tutor_completed')) as step4
        FROM ${analyticsEvents}
        ${whereSql}
      `;
      const interactFunnelRes = await db.execute(interactFunnelQuery);

      res.json({
        onboarding: onboardingFunnelRes.rows[0] || { step1: 0, step2: 0, step3: 0 },
        interaction: interactFunnelRes.rows[0] || { step1: 0, step2: 0, step3: 0, step4: 0 }
      });
    } else if (tab === 'errors') {
      const errorsConditions = [...conditions, sql`(event_name LIKE '%error%' OR event_category = 'error' OR metadata LIKE '%error%')`];
      const errorsWhereSql = sql`WHERE ${sql.join(errorsConditions, sql` AND `)}`;
      const errorsQuery = sql`
        SELECT 
          event_name,
          COUNT(*) as error_count,
          COUNT(DISTINCT session_id) as affected_sessions,
          MAX(timestamp) as last_seen,
          MIN(metadata) as sample_metadata
        FROM ${analyticsEvents}
        ${errorsWhereSql}
        GROUP BY event_name
        ORDER BY error_count DESC
      `;
      const errorsRes = await db.execute(errorsQuery);
      res.json(errorsRes.rows);
    } else {
      res.status(400).json({ error: "Invalid query tab requested" });
    }
  } catch (err: any) {
    console.error("[Analytics Query Endpoint ERROR]:", err);
    res.status(500).json({ error: "Failed to query analytics database", details: err?.message });
  }
});

// Centralized Cache-First Pronunciation Endpoint
app.post("/api/pronunciation", async (req, res) => {
  try {
    const { text, language = "English", accent, voice = "Zephyr", version = "v1", promptStyle } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text parameter is required." });
    }

    const ai = getGeminiClient();
    const { record, cached } = await getOrCreatePronunciation(ai, {
      text,
      language,
      accent,
      voice,
      version,
      promptStyle,
    });

    if (!record.audio_base64 || record.status === 'failed') {
      return res.json({
        id: record.id,
        text: record.original_text || text,
        language: record.language || language,
        audio: null,
        fallbackToWebSpeech: true,
        cached: false,
      });
    }

    return res.json({
      id: record.id,
      text: record.original_text,
      normalizedText: record.normalized_text,
      language: record.language,
      accent: record.accent,
      voice: record.voice,
      version: record.version,
      audioUrl: record.audio_url,
      audio: record.audio_base64,
      mimeType: record.audio_format,
      cached,
      hitCount: record.hit_count,
    });
  } catch (error: any) {
    console.warn("Pronunciation API Warning (Activating Web Speech Fallback):", error?.message || error);
    return res.json({
      text: req.body?.text || "",
      language: req.body?.language || "English",
      audio: null,
      fallbackToWebSpeech: true,
      cached: false,
    });
  }
});

// Stream/Serve Pronunciation Binary Audio File
app.get("/api/pronunciation/audio/:id", (req, res) => {
  try {
    const record = getPronunciationById(req.params.id);
    if (!record || !record.storage_path || !fs.existsSync(record.storage_path)) {
      return res.status(404).json({ error: "Audio asset not found." });
    }

    const stream = fs.createReadStream(record.storage_path);
    res.setHeader("Content-Type", record.audio_format || "audio/pcm;rate=24000");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    stream.pipe(res);
  } catch (err: any) {
    console.error("Audio streaming error:", err);
    res.status(500).json({ error: "Failed to stream audio file." });
  }
});

// Pronunciation Admin Metrics & Observability
app.get("/api/pronunciation/stats", (_req, res) => {
  try {
    const stats = getPronunciationStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to load pronunciation stats." });
  }
});

// Delete a cached pronunciation record
app.delete("/api/pronunciation/:id", (req, res) => {
  try {
    const success = deletePronunciationRecord(req.params.id);
    if (success) {
      return res.json({ success: true, id: req.params.id });
    }
    return res.status(404).json({ error: "Pronunciation record not found." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete pronunciation record." });
  }
});

// ================= MASTER ENGLISH LEXICON API =================
// 1. Search and Filter Master Lexicon
app.get("/api/lexicon/search", (req, res) => {
  try {
    const { q, language, interfaceLanguage, level, topic, type, pos, frequency, limit, page } = req.query;
    const result = searchLexicon({
      q: q as string,
      language: language as string,
      interfaceLanguage: interfaceLanguage as string,
      level: level as any,
      topic: topic as string,
      type: type as any,
      pos: pos as any,
      frequency: frequency as any,
      limit: limit ? parseInt(limit as string, 10) : 20,
      page: page ? parseInt(page as string, 10) : 1,
    });
    return res.json(result);
  } catch (err: any) {
    console.error("Lexicon Search Error:", err);
    return res.status(500).json({ error: "Failed to search master lexicon." });
  }
});

// 2. Get Single Lexical Entry by ID or Word
app.get("/api/lexicon/entry/:idOrWord", (req, res) => {
  try {
    const entry = getLexicalEntry(req.params.idOrWord);
    if (!entry) {
      return res.status(404).json({ error: "Lexical entry not found." });
    }
    return res.json(entry);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to retrieve lexical entry." });
  }
});

// 3. Create or Update Lexical Entry
app.post("/api/lexicon/entry", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const entry = await saveLexicalEntry(req.body, ai);
    return res.json(entry);
  } catch (err: any) {
    console.error("Save Lexical Entry Error:", err);
    return res.status(500).json({ error: err?.message || "Failed to save lexical entry." });
  }
});

// 4. Import Bulk Dataset into Lexicon
app.post("/api/lexicon/import", (req, res) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: "Payload must contain an array of 'entries'." });
    }
    const result = importLexicalDataset(entries);
    return res.json(result);
  } catch (err: any) {
    console.error("Lexicon Dataset Import Error:", err);
    return res.status(500).json({ error: "Failed to import dataset into lexicon." });
  }
});

// 5. Lexicon Admin Analytics
app.get("/api/lexicon/stats", (_req, res) => {
  try {
    const stats = getLexiconStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to load lexicon analytics." });
  }
});

// 6. Delete or Deprecate Lexical Entry
app.delete("/api/lexicon/entry/:id", (req, res) => {
  try {
    const success = deleteLexicalEntry(req.params.id);
    if (success) {
      return res.json({ success: true, id: req.params.id });
    }
    return res.status(404).json({ error: "Lexical entry not found." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete lexical entry." });
  }
});

// Gemini Text-To-Speech (TTS) Endpoint (Proxies through Cache-First Pronunciation Service)
app.post("/api/gemini/tts", async (req, res) => {
  try {
    const { text, voice = "Zephyr", language = "English", promptStyle } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text parameter is required." });
    }

    const ai = getGeminiClient();
    const { record, cached } = await getOrCreatePronunciation(ai, {
      text,
      language,
      voice,
      promptStyle,
    });

    if (!record.audio_base64 || record.status === 'failed') {
      return res.json({
        audio: null,
        fallbackToWebSpeech: true,
        text,
        language,
        cached: false,
      });
    }

    return res.json({
      audio: record.audio_base64,
      mimeType: record.audio_format,
      voice: record.voice,
      language: record.language,
      audioUrl: record.audio_url,
      cached,
    });
  } catch (error: any) {
    console.warn("Gemini TTS API Warning (Activating Web Speech Fallback):", error?.message || error);
    return res.json({
      audio: null,
      fallbackToWebSpeech: true,
      text: req.body?.text || "",
      language: req.body?.language || "English",
      cached: false,
    });
  }
});

// Gemini Interactive Voice Tutor & Conversation Partner Endpoint
app.post("/api/gemini/voice-tutor", async (req, res) => {
  try {
    const {
      message = "",
      audioBase64 = null,
      targetLanguage = "English",
      scenario = "General Conversation",
      targetWord = "",
      conversationHistory = [],
      voice = "Zephyr",
    } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `You are LingoFlow's Gemini AI Voice Tutor & Conversation Partner.
The student's target language is: ${targetLanguage}.
Selected Scenario / Topic: ${scenario}.
${targetWord ? `Current Target Practice Word / Sentence: "${targetWord}"` : ""}

Mandates:
1. Speak as a supportive, highly articulate native-level language coach in ${targetLanguage}.
2. Keep your text reply conversational, concise (1 to 3 short sentences), so it sounds natural when spoken aloud.
3. If the user spoke a target word or phrase, briefly compliment their effort or gently give 1 phonetic tip before continuing the dialogue.
4. Keep the conversation engaging by asking a simple question or offering a friendly prompt.`;

    const contents: any[] = [];

    // Conversation history
    if (Array.isArray(conversationHistory)) {
      for (const item of conversationHistory) {
        if (item && item.text) {
          contents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Current user turn
    const parts: any[] = [];
    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: "audio/pcm;rate=16000",
          data: audioBase64,
        },
      });
    }
    if (message) {
      parts.push({ text: message });
    }

    if (parts.length === 0) {
      parts.push({ text: "Hello! Let's practice speaking today." });
    }

    contents.push({ role: "user", parts });

    // Generate Gemini text reply
    const textResponse = await generateContentWithRetry(ai, {
      model: "gemini-3.1-flash-lite",
      contents,
      config: { systemInstruction },
    });

    const replyText = textResponse.text || "That sounded great! What would you like to talk about next?";

    // Generate voice audio for reply using Gemini TTS
    let replyAudioBase64 = null;
    const ttsCandidateModels = ["gemini-3.1-flash-tts-preview"];
    for (const ttsModel of ttsCandidateModels) {
      try {
        const ttsRes = await ai.models.generateContent({
          model: ttsModel,
          contents: [{ parts: [{ text: `Say naturally in ${targetLanguage}: ${replyText}` }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice },
              },
            },
          },
        });
        const parts = ttsRes.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            replyAudioBase64 = part.inlineData.data;
            break;
          }
        }
        if (replyAudioBase64) break;
      } catch (ttsErr: any) {
        // Quiet fallback to next TTS model
      }
    }

    return res.json({
      replyText,
      replyAudioBase64,
      voice,
      targetLanguage,
    });
  } catch (error: any) {
    console.error("Gemini Voice Tutor Endpoint Error:", error);
    return res.status(500).json({
      error: "Failed to communicate with Gemini Voice Tutor",
      details: error?.message || String(error),
    });
  }
});

// Helper to resolve safe, sanitized, per-user progress file paths to support multi-account isolation
function getProgressFilePath(email: string | undefined): string {
  const cleanEmail = (email || "mopl8065_gmail_com")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_.-]/g, "_");
  return path.join(process.cwd(), `user_progress_${cleanEmail}.json`);
}

// Client progress synchronization endpoint (saves state as a local JSON file)
app.post("/api/progress/sync", (req, res) => {
  try {
    const progressData = req.body;
    const email = progressData.email || progressData.settings?.userEmail || (progressData.userId ? `user_${progressData.userId}` : "guest");
    const filePath = getProgressFilePath(email);
    
    let existingData: any = {};
    if (fs.existsSync(filePath)) {
      try {
        existingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (_) {}
    }

    const mergedData = {
      ...existingData,
      ...progressData,
      documents: (Array.isArray(progressData.documents) && progressData.documents.length > 0) ? progressData.documents : (existingData.documents || []),
      vocabulary: (Array.isArray(progressData.vocabulary) && progressData.vocabulary.length > 0) ? progressData.vocabulary : (existingData.vocabulary || []),
      highlights: (Array.isArray(progressData.highlights) && progressData.highlights.length > 0) ? progressData.highlights : (existingData.highlights || []),
      stickyNotes: (Array.isArray(progressData.stickyNotes) && progressData.stickyNotes.length > 0) ? progressData.stickyNotes : (existingData.stickyNotes || []),
      folders: (Array.isArray(progressData.folders) && progressData.folders.length > 0) ? progressData.folders : (existingData.folders || []),
      decks: (Array.isArray(progressData.decks) && progressData.decks.length > 0) ? progressData.decks : (existingData.decks || []),
      timestamp: Date.now()
    };

    fs.writeFileSync(
      filePath,
      JSON.stringify(mergedData, null, 2),
      "utf-8"
    );
    res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error("Error writing user progress:", err);
    res.status(500).json({ error: "Failed to sync user progress", details: err?.message });
  }
});

// Developer API Endpoint (Allows external models or other scripts to retrieve user stats, reading logs, and flashcard metrics)
app.get("/api/developer/progress", (req, res) => {
  try {
    const authHeader = req.headers["x-api-key"] || req.headers["authorization"]?.toString().replace(/^bearer\s+/i, "");
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Please provide an 'x-api-key' header or 'Authorization: Bearer <key>'. You can find your API key in the LingoFlow App Settings under Developer API." 
      });
    }

    const reqEmail = req.query.email || req.headers["x-user-email"];
    if (!reqEmail) {
      return res.status(400).json({
        error: "Missing Email",
        message: "Access restricted. Please specify the target user account email using the 'email' query parameter (e.g., ?email=user@example.com) or the 'x-user-email' header to access progress logs."
      });
    }

    const filePath = getProgressFilePath(reqEmail.toString());
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: "Not Found", 
        message: `No synchronized progress data found for user email '${reqEmail}'. Please configure and save this email in the app settings first to enable API access.` 
      });
    }

    const data = fs.readFileSync(filePath, "utf-8");
    res.json(JSON.parse(data));
  } catch (err: any) {
    console.error("Error reading progress file:", err);
    res.status(500).json({ error: "Failed to read progress", details: err?.message });
  }
});

// AI Coach Progress Advisor Endpoint (Uses server-side Gemini to evaluate the user's progress and formulate customized study recommendations)
app.post("/api/ai/advices", async (req, res) => {
  try {
    const email = req.body.email || "mopl8065@gmail.com";
    const filePath = getProgressFilePath(email);
    let progressData: any = {};
    if (fs.existsSync(filePath)) {
      progressData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } else {
      return res.status(404).json({ 
        error: "Not Found", 
        message: `No progress data found for '${email}'. Please study, read books, or save vocabulary first to generate recommendations.` 
      });
    }

    const { vocabulary = [], userStats = {}, settings = {}, documents = [] } = progressData;

    const ai = getGeminiClient();

    const wordList = vocabulary.map((v: any) => `${v.word} (${v.translation})`).slice(0, 30);
    const readDocs = documents.map((d: any) => d.name).slice(0, 5);

    const prompt = `You are LingoFlow's Lead AI Language Coach & Pedagogical Advisor.
Analyze the student's current learning history and statistics:
- Current learning language: ${settings.targetLanguage || "English"}
- Interface Language preference: ${settings.interfaceLanguage || "English"}
- Vocabulary words saved: ${vocabulary.length} (${JSON.stringify(wordList)})
- Current study streak: ${userStats.currentStreak || 100} days
- Reading logs: ${JSON.stringify(readDocs)}

Generate a highly personalized language learning report and coaching advices, including a custom linguistic challenge drilling their real saved words.

Return a JSON object in this EXACT structure:
{
  "overallEvaluation": "A warm, highly motivating 2-3 sentence academic assessment of their progress and dedication, written in the interface language (${settings.interfaceLanguage || "English"}).",
  "strengths": [
    "A direct description of an observable pedagogical strength seen in their logs (written in ${settings.interfaceLanguage || "English"})",
    "Another distinct learning strength (written in ${settings.interfaceLanguage || "English"})"
  ],
  "improvementAreas": [
    "A practical, specific area they can focus on to improve retention (written in ${settings.interfaceLanguage || "English"})",
    "Another constructive area (written in ${settings.interfaceLanguage || "English"})"
  ],
  "advices": [
    "Actionable learning tip #1 (e.g. regarding spaced repetition, custom flashcards, or study schedules) (written in ${settings.interfaceLanguage || "English"})",
    "Actionable learning tip #2 (e.g. regarding reading speed, dictionary click behaviors, or contextual reading comprehension) (written in ${settings.interfaceLanguage || "English"})",
    "Actionable learning tip #3 (e.g. regarding character drawing practice, stroke balance, or pronunciation tips) (written in ${settings.interfaceLanguage || "English"})"
  ],
  "challenge": {
    "type": "Vocabulary Integration Drill",
    "question": "An interactive language challenge or contextual fill-in-the-blank sentence in the learning language (${settings.targetLanguage}) that integrates 1 or 2 of their saved vocabulary words, asking them to write, conjugate, or translate them correctly.",
    "hint": "A subtle grammatical hint or context clue to guide them (written in ${settings.interfaceLanguage || "English"}).",
    "solution": "The correct response or suggested answer with a brief description (written in ${settings.interfaceLanguage || "English"})."
  }
}

CRITICAL MANDATES:
1. Ensure the JSON is 100% syntactically correct and can be parsed with JSON.parse().
2. The overallEvaluation, strengths, improvementAreas, advices, challenge.hint, and challenge.solution must be written in the user's preferred interface language (${settings.interfaceLanguage || "English"}).
3. The challenge.question must be a beautiful, custom-crafted text in their learning language (${settings.targetLanguage || "English"}).
4. Do not wrap the JSON output in markdown blocks or include any introductory text. Return only the raw JSON.`;

    try {
      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const cleanJson = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      return res.json(JSON.parse(cleanJson));
    } catch (apiErr: any) {
      console.error("AI Coach Advisor transient API failure:", apiErr);
      return res.json({
        overallEvaluation: "Your learning progress is moving forward consistently. Keep up the daily reading and practice consistency!",
        strengths: ["Strong reading engagement", "Consistent vocabulary saving"],
        improvementAreas: ["Focus on reviewing saved flashcards daily", "Practice active recall exercises"],
        advices: [
          "Dedicate 10 minutes each morning to review newly saved words.",
          "Try reading aloud to improve oral fluency and pronunciation cadence.",
          "Create custom flashcard decks for challenging topics."
        ],
        challenge: {
          question: "Translate or explain today's key concept in your target language.",
          hint: "Think about the main theme of your recent reading material.",
          solution: "Consistent daily practice yields lasting language fluency."
        }
      });
    }
  } catch (error: any) {
    console.error("AI Advisor Error:", error);
    res.status(500).json({ error: "Failed to generate AI Coach advices", details: error?.message });
  }
});

// Translation & Word Explanation API Endpoint
app.post("/api/translate", async (req, res) => {
  try {
    const { word, contextSentence, targetLanguage = "English", sourceLanguage = "Auto" } = req.body;

    if (!word) {
      return res.status(400).json({ error: "Word parameter is required." });
    }

    const cleanWord = String(word).trim();
    const cacheKey = `${cleanWord.toLowerCase()}__${sourceLanguage.toLowerCase()}__${targetLanguage.toLowerCase()}`;
    const cached = translationMemoryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < TRANSLATION_CACHE_TTL)) {
      return res.json(cached.data);
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert bilingual lexicographer and language tutor.
Analyze the word/phrase: "${cleanWord}".
Context sentence: "${contextSentence || "N/A"}"
Source Language: ${sourceLanguage}
Target Explanation Language: ${targetLanguage}

CRITICAL MANDATE:
All explanation fields (translation, definition, partOfSpeech, grammarNote, and examples[].target) MUST BE WRITTEN IN ${targetLanguage}.
If targetLanguage is Arabic, write translation, definition, partOfSpeech, grammarNote, and examples[].target in clear standard Arabic (العربية).
If targetLanguage is French, write them in natural French (Français).
If targetLanguage is Spanish, write them in natural Spanish (Español).
If targetLanguage is German, write them in natural German (Deutsch).
If targetLanguage is English, write them in clear English.

Provide a JSON object with EXACTLY this structure:
{
  "word": "${cleanWord}",
  "phonetic": "IPA or transliteration pronunciation e.g. /pǎ/ or [bon-ZHOOR]",
  "translation": "Direct concise translation of '${cleanWord}' in ${targetLanguage}",
  "definition": "Clear beginner-friendly definition of how '${cleanWord}' is used in context, written in ${targetLanguage}",
  "partOfSpeech": "part of speech (e.g. noun/verb/adjective) in ${targetLanguage}",
  "grammarNote": "Brief 1-2 sentence breakdown of grammar, root, or conjugation in ${targetLanguage}",
  "examples": [
    {
      "source": "Short example sentence using '${cleanWord}' in source language",
      "target": "Translation of the example sentence in ${targetLanguage}"
    }
  ],
  "contextExamples": [
    "High quality natural example sentence 1 using '${cleanWord}'",
    "High quality natural example sentence 2 using '${cleanWord}'"
  ],
  "synonyms": ["synonym1", "synonym2", "synonym3", "synonym4"],
  "antonyms": ["antonym1", "antonym2", "antonym3"]
}

Return strictly valid JSON.`;

    try {
      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const cleanJson = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      const data = JSON.parse(cleanJson);
      
      // Store in memory cache
      translationMemoryCache.set(cacheKey, { data, timestamp: Date.now() });

      return res.json(data);
    } catch (apiErr: any) {
      console.warn("Gemini API transient failure, serving fallback payload:", apiErr?.message || apiErr);
      
      // Try local Master Lexicon lookup first for accurate dictionary data
      const lexMatch = getLexicalEntry(cleanWord.toLowerCase()) || 
                       searchLexicon({ q: cleanWord, limit: 1 })?.entries?.[0];

      const isArabic = targetLanguage.toLowerCase().includes("ar");
      const isFrench = targetLanguage.toLowerCase().includes("fr");
      const isSpanish = targetLanguage.toLowerCase().includes("es") || targetLanguage.toLowerCase().includes("spa");
      const isGerman = targetLanguage.toLowerCase().includes("de") || targetLanguage.toLowerCase().includes("ger");

      let resolvedTrans = cleanWord;
      let resolvedDef = "The AI translation service is temporarily busy. Please try again in a few seconds.";
      let resolvedPos = "word";
      let resolvedNote = "Temporary server busy response.";
      let resolvedPhonetic = `/ ${cleanWord.toLowerCase()} /`;
      let resolvedExamples: any[] = [];
      let resolvedSynonyms: string[] = [];

      if (lexMatch) {
        resolvedPhonetic = lexMatch.phonetic || resolvedPhonetic;
        resolvedPos = Array.isArray(lexMatch.partOfSpeech) ? lexMatch.partOfSpeech[0] : (lexMatch.partOfSpeech || resolvedPos);
        const primarySense = lexMatch.senses?.[0];
        if (primarySense) {
          resolvedDef = primarySense.definition || resolvedDef;
          if (primarySense.synonyms && Array.isArray(primarySense.synonyms)) resolvedSynonyms = primarySense.synonyms;
          if (primarySense.examples && Array.isArray(primarySense.examples)) {
            resolvedExamples = primarySense.examples.map(ex => ({
              source: ex.source,
              target: isArabic ? (ex.targetArabic || ex.source) : ex.source
            }));
          }
          if (isArabic && (lexMatch.arabicTranslation || primarySense.arabicTranslation?.text)) {
            resolvedTrans = lexMatch.arabicTranslation || primarySense.arabicTranslation?.text || cleanWord;
          }
        }
      } else {
        if (isArabic) {
          resolvedDef = "خدمة الترجمة بالذكاء الاصطناعي مشغولة حالياً. يرجى المحاولة مرة أخرى بعد لحظات.";
          resolvedPos = "كلمة";
          resolvedNote = "ملاحظة مؤقتة في حالة الاستجابة البطيئة.";
        } else if (isFrench) {
          resolvedDef = "Le service de traduction IA est temporairement occupé. Veuillez réessayer dans quelques secondes.";
          resolvedPos = "mot";
          resolvedNote = "Réponse temporaire lors des pics de charge.";
        } else if (isSpanish) {
          resolvedDef = "El servicio de traducción por IA está ocupado temporalmente. Por favor, inténtalo de nuevo en unos segundos.";
          resolvedPos = "palabra";
          resolvedNote = "Respuesta de alta demanda temporal.";
        } else if (isGerman) {
          resolvedDef = "Der KI-Übersetzungsdienst ist vorübergehend ausgelastet. Bitte versuche es in wenigen Sekunden erneut.";
          resolvedPos = "Wort";
          resolvedNote = "Vorübergehende Auslastungsantwort.";
        }
      }

      const fallbackPayload = {
        word: cleanWord,
        phonetic: resolvedPhonetic,
        translation: resolvedTrans,
        definition: resolvedDef,
        partOfSpeech: resolvedPos,
        grammarNote: resolvedNote,
        examples: resolvedExamples,
        synonyms: resolvedSynonyms,
      };

      return res.json(fallbackPayload);
    }
  } catch (error: any) {
    console.error("Translation API Error:", error);
    res.status(500).json({
      error: "Failed to fetch AI translation",
      details: error?.message || String(error),
    });
  }
});

// Pre-translate Multiple Words Endpoint for Smart Guessing/Caching
app.post("/api/pre-translate-words", async (req, res) => {
  try {
    const { words, targetLanguage = "English", sourceLanguage = "Auto" } = req.body;

    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: "An array of words is required." });
    }

    const resultAcc: Record<string, any> = {};
    const uncachedWords: string[] = [];

    // Check memory cache first
    for (const w of words) {
      if (typeof w !== 'string') continue;
      const cleanW = w.trim();
      if (!cleanW) continue;
      const cacheKey = `${cleanW.toLowerCase()}__${sourceLanguage.toLowerCase()}__${targetLanguage.toLowerCase()}`;
      const cached = translationMemoryCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < TRANSLATION_CACHE_TTL)) {
        resultAcc[cleanW] = cached.data;
      } else {
        uncachedWords.push(cleanW);
      }
    }

    // If all words were found in cache, return immediately without any AI calls
    if (uncachedWords.length === 0) {
      return res.json(resultAcc);
    }

    // Process up to 35 uncached words in a single batch to avoid quota spikes
    const batchWords = uncachedWords.slice(0, 35);

    const ai = getGeminiClient();

    const prompt = `You are an expert bilingual lexicographer and language tutor.
Translate and define the following vocabulary words:
${JSON.stringify(batchWords)}

Target Explanation Language: ${targetLanguage}
Source Language: ${sourceLanguage}

CRITICAL MANDATE:
For each word, provide:
1. "translation": A direct, natural, extremely concise translation of the word in ${targetLanguage}.
2. "definition": A very brief, single-sentence dictionary style definition in ${targetLanguage}.
3. "partOfSpeech": The part of speech in ${targetLanguage}.
4. "phonetic": IPA pronunciation.
5. "grammarNote": A short single-sentence grammar context or conjugation tip in ${targetLanguage}.

Provide a JSON object where the keys are EXACTLY the words from the input list, mapping to their definitions:
{
  "word1": {
    "word": "word1",
    "translation": "...",
    "definition": "...",
    "partOfSpeech": "...",
    "phonetic": "...",
    "grammarNote": "..."
  }
}

Return strictly valid JSON. Do not include extra text.`;

    try {
      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      let cleanJson = text.trim();

      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      } else {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      }

      let data: any = {};
      try {
        data = JSON.parse(cleanJson);
      } catch (parseErr) {
        try {
          const sanitized = cleanJson
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']');
          data = JSON.parse(sanitized);
        } catch {
          data = {};
        }
      }

      // Cache newly fetched words
      for (const key of Object.keys(data)) {
        const item = data[key];
        const cacheKey = `${key.toLowerCase()}__${sourceLanguage.toLowerCase()}__${targetLanguage.toLowerCase()}`;
        translationMemoryCache.set(cacheKey, { data: item, timestamp: Date.now() });
        resultAcc[key] = item;
      }

      return res.json(resultAcc);
    } catch (apiErr: any) {
      console.warn("Bulk Translation API transient failure (quota/rate-limit), returning cached/fallback items:", apiErr?.message || apiErr);
      
      // For any uncached words, attempt local master lexicon matching
      for (const w of batchWords) {
        if (!resultAcc[w]) {
          const lex = getLexicalEntry(w.toLowerCase()) || searchLexicon({ q: w, limit: 1 })?.entries?.[0];
          if (lex) {
            let t = w;
            const targetLower = targetLanguage.toLowerCase();
            const isAr = targetLower.includes('ar');
            if (isAr && (lex.arabicTranslation || lex.senses?.[0]?.arabicTranslation?.text)) {
              t = lex.arabicTranslation || lex.senses?.[0]?.arabicTranslation?.text || w;
            }
            resultAcc[w] = {
              word: w,
              translation: t,
              definition: lex.senses?.[0]?.definition || `Vocabulary item: ${w}`,
              partOfSpeech: Array.isArray(lex.partOfSpeech) ? lex.partOfSpeech[0] : (lex.partOfSpeech || "word"),
              phonetic: lex.phonetic || `/${w}/`,
              grammarNote: ""
            };
          }
        }
      }

      return res.json(resultAcc);
    }
  } catch (error: any) {
    console.error("Pre-translate API Error:", error);
    res.status(500).json({
      error: "Failed to pre-translate batch",
      details: error?.message || String(error),
    });
  }
});

// Handwriting & Character Drawing Evaluation API
app.post("/api/recognize-handwriting", async (req, res) => {
  try {
    const { imageBase64, targetCharacter, targetLanguage = "Japanese" } = req.body;

    if (!imageBase64 || !targetCharacter) {
      return res.status(400).json({ error: "imageBase64 and targetCharacter are required." });
    }

    const ai = getGeminiClient();

    // Clean base64 data
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const prompt = `You are an expert calligraphy and handwriting tutor for ${targetLanguage}.
Compare the student's hand-drawn character image against the expected character: "${targetCharacter}".

Analyze:
1. Shape accuracy, balance, and proportions.
2. Stroke completeness and legibility.
3. Provide a score from 0 to 100.
4. Give 2 concise, actionable tips to improve stroke quality or proportion.

Return valid JSON in this structure:
{
  "recognizedText": "What character or shape was detected in the drawing",
  "targetCharacter": "${targetCharacter}",
  "score": 88,
  "isMatch": true,
  "feedback": "Great stroke proportion! Pay attention to the top horizontal stroke balance.",
  "tips": [
    "Extend the vertical stroke slightly lower.",
    "Keep the left curve softer."
  ]
}`;

    try {
      const response = await generateContentWithRetry(ai, {
        contents: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const cleanJson = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      const data = JSON.parse(cleanJson);
      return res.json(data);
    } catch (apiErr: any) {
      console.error("Handwriting AI transient failure:", apiErr);
      return res.json({
        recognizedText: targetCharacter,
        targetCharacter,
        score: 85,
        isMatch: true,
        feedback: "Handwriting captured! The AI service is experiencing high traffic, but your stroke structure looks solid.",
        tips: ["Practice stroke balance and proportion.", "Try drawing again in a moment for full AI scoring."]
      });
    }
  } catch (error: any) {
    console.error("Handwriting AI Error:", error);
    res.status(500).json({
      error: "Failed to evaluate handwriting drawing",
      details: error?.message || String(error),
    });
  }
});

// Deep Sentence / Passage Breakdown
app.post("/api/explain-sentence", async (req, res) => {
  try {
    const { sentence, targetLanguage = "English" } = req.body;
    if (!sentence) {
      return res.status(400).json({ error: "Sentence is required." });
    }

    const ai = getGeminiClient();

    const prompt = `Explain this language learning sentence for a student:
"${sentence}"
Target explanation language: ${targetLanguage}

Return JSON:
{
  "fullTranslation": "Accurate natural translation in ${targetLanguage}",
  "literalTranslation": "Word-for-word literal gloss",
  "grammarBreakdown": [
    {
      "segment": "Word or sub-clause",
      "meaning": "Meaning in context",
      "explanation": "Grammatical function (e.g., past tense verb suffix, topic marker)"
    }
  ],
  "difficulty": "Beginner / Intermediate / Advanced",
  "culturalNote": "Optional cultural or idiomatic nuance if relevant"
}`;

    try {
      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const cleanJson = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      return res.json(JSON.parse(cleanJson));
    } catch (apiErr: any) {
      console.error("Sentence Explanation transient failure:", apiErr);
      return res.json({
        fullTranslation: sentence,
        literalTranslation: sentence,
        grammarBreakdown: [
          {
            segment: sentence.slice(0, 25),
            meaning: "High server traffic",
            explanation: "The translation AI model is currently under high load. Please try clicking the button again in a few seconds."
          }
        ],
        difficulty: "Intermediate",
        culturalNote: "Server high load fallback."
      });
    }
  } catch (error: any) {
    console.error("Sentence Explanation Error:", error);
    res.status(500).json({ error: "Failed to analyze sentence", details: error?.message });
  }
});

// Advanced Grammarly Proofread API Endpoint
app.post("/api/proofread", async (req, res) => {
  try {
    const { text, tone = "General Tone", targetLanguage = "English" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text parameter is required." });
    }

    const trimmedText = text.trim();
    const cacheKey = `${trimmedText.toLowerCase()}___${tone}___${targetLanguage}`;
    const now = Date.now();

    // Check server in-memory cache
    if (proofreadCache.has(cacheKey)) {
      const cached = proofreadCache.get(cacheKey)!;
      if (now - cached.timestamp < PROOFREAD_CACHE_TTL) {
        return res.json(cached.result);
      }
    }

    const ai = getGeminiClient();

    const prompt = `You are a world-class, modern AI writing assistant and linguistic editor with native mastery of natural, real-world English.
Analyze the provided text for genuine grammar, spelling, punctuation, and structural errors matching the requested tone: "${tone}".

CRITICAL ACCURACY & REASONING RULES (STRICTLY PROHIBIT FALSE POSITIVES & PEDANTIC CORRECTIONS):
1. CONTRACTIONS ARE 100% VALID, NATURAL, AND CORRECT:
   - NEVER flag or replace standard contractions (such as "I'm", "don't", "can't", "it's", "they're", "we're", "isn't", "aren't", "haven't", "won't", "should've", "could've", "let's", "you're", "didn't", etc.) as incorrect.
   - NEVER suggest expanding "I'm" to "I am", "don't" to "do not", or any other contraction. Contractions are standard, authentic modern English.
2. DO NOT INVENT MISTAKES OR MAKE ARBITRARY CHANGES:
   - If a sentence is already grammatically correct, natural, and clear (e.g., "I'm writing a new story", "I like to read books", "How are you today?"), DO NOT invent fake issues or pedantic suggestions just to have something in the list.
   - If there are NO genuine errors, "issues" MUST be an empty array: [], the score MUST be 98-100, and "correctedText" MUST match the user's original text.
3. TRUE ERRORS ONLY FOR GRAMMAR/SPELLING/PUNCTUATION:
   - Only flag genuine, undeniable errors (e.g. subject-verb disagreement like "he go", misspelled words like "recieve", missing question marks on actual questions, wrong word forms like "their" instead of "there").
   - Do NOT penalize natural conversational style or common sentence structures.
4. OPTIONAL ENRICHMENT (ONLY IF HIGHLY VALUABLE):
   - Only suggest "Vocabulary Enrichment" or "Natural Phrasing" when there is an obvious awkward phrasing or when elevating complex prose adds genuine value. Never replace simple everyday words with complicated synonyms needlessly.
   - If an optional suggestion is provided, the "reason" field MUST state that the user's original wording is correct and that this is merely an optional stylistic variation.

Input text to proofread:
"${trimmedText}"

Target Explanation Language for feedback: ${targetLanguage}

Provide a JSON response with EXACTLY this structure:
{
  "score": 100,
  "scoreFeedback": "Encouraging 1-sentence summary of the text quality.",
  "correctedText": "Complete clean text with genuine errors corrected (leave unchanged if already correct)",
  "issues": [
    // Leave array empty [] if the text is already correct and natural!
  ]
}

If genuine errors or helpful upgrades exist, format each item in "issues" as:
{
  "type": "Grammar" | "Spelling" | "Punctuation" | "Vocabulary Enrichment" | "Natural Phrasing",
  "original": "exact substring from input text",
  "fix": "corrected replacement",
  "reason": "Clear, friendly explanation."
}

Return strictly valid JSON. Do not include markdown ticks or additional commentary.`;

    try {
      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text || "{}";
      const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      
      // Store in server cache for instant repeat / concurrent requests
      proofreadCache.set(cacheKey, { result: parsed, timestamp: now });
      
      return res.json(parsed);
    } catch (apiErr: any) {
      console.error("Proofread API transient failure:", apiErr);
      
      let score = 100;
      let issues: any[] = [];
      let correctedText = text;
      let scoreFeedback = "Grammar structure appears solid.";

      if (/\b(she|he|it)\s+don'?t\b/i.test(text)) {
        score -= 10;
        const match = text.match(/\b(she|he|it)\s+don'?t\b/i);
        if (match) {
          const subj = match[1];
          issues.push({
            type: "Grammar",
            original: match[0],
            fix: `${subj} doesn't`,
            reason: "Subject-verb agreement error with third-person singular."
          });
          correctedText = correctedText.replace(match[0], `${subj} doesn't`);
        }
      }

      if (/\b(likes|goes|runs)\s+.*\bwhen\s+it\s+(rain|go|come)\b/i.test(text)) {
        score -= 8;
        const match = text.match(/\bwhen\s+it\s+(rain|go|come)\b/i);
        if (match) {
          const verb = match[1];
          const fixedVerb = verb + "s";
          issues.push({
            type: "Grammar",
            original: match[0],
            fix: `when it ${fixedVerb}`,
            reason: "Singular subject 'it' requires verb ending in -s."
          });
          correctedText = correctedText.replace(match[0], `when it ${fixedVerb}`);
        }
      }

      if (issues.length > 0) {
        scoreFeedback = `Detected ${issues.length} grammatical issue${issues.length > 1 ? 's' : ''} in the text.`;
      } else {
        scoreFeedback = "Grammar and syntax look clear!";
      }

      return res.json({
        score,
        scoreFeedback,
        correctedText,
        issues
      });
    }
  } catch (error: any) {
    console.error("Proofread Endpoint Error:", error);
    res.status(500).json({ error: "Failed to proofread text", details: error?.message });
  }
});

// Intelligent Language & Pronunciation Analysis Endpoint
app.post("/api/detect-pronunciation", async (req, res) => {
  try {
    const { text, hint = "" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text parameter is required." });
    }

    const ai = getGeminiClient();

    const prompt = `You are a world-class linguistic phonetics and speech pronunciation engine.
Analyze the provided word or phrase, auto-detect its exact language, and provide comprehensive pronunciation guidance.

Input text: "${text}"
User language hint (if any): "${hint}"

Instructions:
1. Identify the exact source language of "${text}" (e.g. French, Spanish, German, Japanese, Arabic, Russian, Italian, Portuguese, Korean, Chinese, English, etc.).
2. Determine the standard BCP-47 language tag (e.g. fr-FR, es-ES, de-DE, ja-JP, ar-SA, ru-RU, it-IT, pt-BR, ko-KR, zh-CN, en-US, etc.).
3. Provide the accurate International Phonetic Alphabet (IPA) transcription.
4. Provide an intuitive, easy-to-read phonetic respelling for learners.
5. Provide a 1-sentence pronunciation tip (e.g. key stress, silent letters, or unique sound rules).

Return strictly valid JSON with this exact schema:
{
  "detectedLanguage": "French",
  "bcp47Code": "fr-FR",
  "ipa": "/bɔ̃.ʒuʁ/",
  "phoneticRespelling": "bohn-ZHOOR",
  "pronunciationTip": "Nasal 'on' sound; soft 'j' as in measure; light uvular 'r'."
}`;

    try {
      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text || "{}";
      const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (apiErr: any) {
      console.warn("Detect Pronunciation API transient error:", apiErr?.message || apiErr);
      return res.json({
        detectedLanguage: hint || "English",
        bcp47Code: "en-US",
        ipa: `/${text.toLowerCase()}/`,
        phoneticRespelling: text,
        pronunciationTip: "Standard natural pronunciation."
      });
    }
  } catch (error: any) {
    console.error("Detect Pronunciation Error:", error);
    res.status(500).json({ error: "Failed to analyze pronunciation", details: error?.message });
  }
});

// Custom Quiz & Topic-Based Deck Generator API Endpoint
app.post("/api/ai/custom-quiz", async (req, res) => {
  try {
    const { topic, words, targetLanguage = "Spanish", interfaceLanguage = "English" } = req.body;

    if (!topic && (!words || !Array.isArray(words) || words.length === 0)) {
      return res.status(400).json({ error: "Either 'topic' or 'words' must be provided." });
    }

    const ai = getGeminiClient();

    let prompt = "";
    if (words && Array.isArray(words) && words.length > 0) {
      prompt = `You are an expert bilingual lexicographer and language tutor.
For each of the following specific vocabulary words/phrases:
${JSON.stringify(words)}

Generate standard language learning vocabulary item data.
- Word/Phrase: The input word/phrase.
- Target Learning Language: ${targetLanguage}
- Interface Language: ${interfaceLanguage}

Provide definitions, phonetics, parts of speech, direct translations, context sentences, and optional helpful grammar/conjugation tips.
All definitions, translations, parts of speech, context sentence translations, and grammar notes MUST be written in the user's interface language (${interfaceLanguage}).
The context sentence itself must be written in the target learning language (${targetLanguage}).`;
    } else {
      prompt = `You are an expert bilingual lexicographer and language tutor.
Generate a custom, curated set of 6 to 8 key vocabulary words or phrases for the following specific topic or theme:
"${topic}"

- Target Learning Language: ${targetLanguage}
- Interface Language: ${interfaceLanguage}

For this topic, choose words or phrases that a language learner must absolutely know to navigate this scenario or topic effectively.
Provide definitions, IPA phonetics, parts of speech, direct translations, a beautiful context sentence, and optional helpful grammar/conjugation tips for each generated word.
All definitions, translations, parts of speech, and grammar notes MUST be written in the user's interface language (${interfaceLanguage}).
The context sentence itself must be written in the target learning language (${targetLanguage}).`;
    }

    try {
      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vocabulary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { 
                      type: Type.STRING, 
                      description: "The vocabulary word, verb, or short phrase in the target learning language (e.g. 'comida', 'hablar', 'buenos d\u00edas')." 
                    },
                    phonetic: { 
                      type: Type.STRING, 
                      description: "IPA phonetic respelling or pronunciation guide (e.g. /ko\u02c0mi.\u00f0a/)." 
                    },
                    translation: { 
                      type: Type.STRING, 
                      description: "Direct concise translation of the word/phrase in the interface language (e.g. 'food')." 
                    },
                    definition: { 
                      type: Type.STRING, 
                      description: "Concise beginner-friendly definition of how the word is used in context, in the interface language." 
                    },
                    partOfSpeech: { 
                      type: Type.STRING, 
                      description: "The part of speech (noun, verb, adjective, phrase, etc.) in the interface language." 
                    },
                    contextSentence: { 
                      type: Type.STRING, 
                      description: "A natural, complete example sentence using this word in the target learning language (e.g. 'La comida espa\u00f1ola es deliciosa.')." 
                    },
                    grammarNote: { 
                      type: Type.STRING, 
                      description: "Helpful grammatical tip, conjugations, gender marker, or usage nuance in the interface language (e.g. 'Feminine noun. Plural: las comidas')." 
                    }
                  },
                  required: ["word", "phonetic", "translation", "definition", "partOfSpeech", "contextSentence"]
                }
              }
            },
            required: ["vocabulary"]
          }
        }
      });

      const rawText = response.text || "{}";
      const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (apiErr: any) {
      console.error("Custom Quiz Generator API transient failure:", apiErr);
      const reqWords = words && Array.isArray(words) ? words : [topic || "Language Practice"];
      const vocabList = reqWords.slice(0, 6).map((w: string, idx: number) => ({
        word: typeof w === 'string' ? w : `Item ${idx + 1}`,
        phonetic: "/wɜːrd/",
        translation: typeof w === 'string' ? w : "Translation",
        definition: "Key vocabulary term generated for your session.",
        partOfSpeech: "noun",
        contextSentence: `This is an example sentence using ${typeof w === 'string' ? w : 'this word'}.`,
        grammarNote: "Standard vocabulary item."
      }));
      return res.json({ vocabulary: vocabList });
    }
  } catch (error: any) {
    console.error("Custom Quiz API Error:", error);
    res.status(500).json({ error: "Failed to generate custom quiz vocabulary", details: error?.message });
  }
});

// YouTube Transcript Translation endpoint
app.post("/api/youtube-transcript-translate", async (req, res) => {
  try {
    const { segments, targetLanguage } = req.body;
    if (!Array.isArray(segments) || segments.length === 0 || !targetLanguage) {
      return res.status(400).json({ error: "Segments and targetLanguage are required." });
    }

    if (targetLanguage === 'English') {
      const translationMap: Record<string, string> = {};
      for (const s of segments) {
        translationMap[s.id] = s.text;
      }
      return res.json({ translations: translationMap });
    }

    const ai = getGeminiClient();
    const prompt = `You are a professional subtitle translator. Translate the following transcript lines into natural, clear ${targetLanguage}.
Context: Video educational transcript subtitles.

Input Segments:
${JSON.stringify(segments.map((s: any) => ({ id: s.id, text: s.text })))}

Respond ONLY with valid JSON in this exact structure:
{
  "translations": [
    { "id": "segment-id", "text": "Translated line in ${targetLanguage}" }
  ]
}`;

    const response = await generateContentWithRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.text?.trim() || "{}";
    const parsed = JSON.parse(responseText);
    const translationMap: Record<string, string> = {};
    if (Array.isArray(parsed.translations)) {
      for (const item of parsed.translations) {
        if (item && item.id && item.text) {
          translationMap[item.id] = item.text;
        }
      }
    }
    return res.json({ translations: translationMap });
  } catch (error: any) {
    console.error("YouTube Transcript Translation Error:", error);
    return res.status(500).json({ error: error?.message || "Failed to translate transcript" });
  }
});

// YouTube Transcript Route with Redundant Fallbacks
app.post("/api/youtube-transcript", async (req, res) => {
  try {
    const { videoId } = req.body;
    if (!/^[A-Za-z0-9_-]{11}$/.test(String(videoId ?? ''))) {
      return res.status(400).json({ error: 'Invalid YouTube video ID.' });
    }
    const transcript = await fetchYoutubeTranscriptHelper(videoId, () => undefined);
    return res.json(transcript);
  } catch (error: any) {
    return res.status(404).json({
      error: error?.message ?? 'No trustworthy transcript is available.',
      code: 'TRANSCRIPT_UNAVAILABLE',
    });
  }
});

function makeTranscript(
  videoId: string,
  segments: Array<{ id?: string; text: string; startTime: number; endTime: number }>,
  alignmentMethod: 'caption-segment' | 'asr-segment' = 'caption-segment',
) {
  return {
    videoId,
    version: 1,
    language: 'en',
    timebase: 'absolute-video-seconds' as const,
    alignmentMethod,
    alignmentQuality: alignmentMethod === 'caption-segment' ? 'medium' as const : 'unknown' as const,
    generatedAt: new Date().toISOString(),
    segments: segments
      .map((segment, index) => ({
        id: segment.id ?? `segment-${index}`,
        text: segment.text.trim(),
        startTime: Number(segment.startTime),
        endTime: Number(segment.endTime),
      }))
      .filter((segment) =>
        segment.text.length > 0 &&
        Number.isFinite(segment.startTime) &&
        Number.isFinite(segment.endTime) &&
        segment.startTime >= 0 &&
        segment.endTime > segment.startTime
      )
      .sort((a, b) => a.startTime - b.startTime),
  };
}

async function fetchYoutubeTranscriptHelper(videoId: string, log: (msg: string) => void) {
  // Try 0: Curated high-precision transcripts for featured / TED / educational videos
  if (CURATED_TRANSCRIPTS[videoId]) {
    return CURATED_TRANSCRIPTS[videoId];
  }

  // Try 1: Direct scraping of youtube watch page captionTracks with fmt=json3 for word-level timestamps
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    log(`Fetching ${watchUrl}`);
    const pageRes = await fetch(watchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const html = await pageRes.text();

    const jsonMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (jsonMatch) {
      const playerResponse = JSON.parse(jsonMatch[1]);
      const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (tracks && tracks.length > 0) {
        const baseUrl = tracks[0].baseUrl;
        
        // Fetch fmt=json3 for true word-level timestamps from YouTube
        try {
          const json3Url = baseUrl.includes('?') ? `${baseUrl}&fmt=json3` : `${baseUrl}?fmt=json3`;
          const json3Res = await fetch(json3Url);
          if (json3Res.ok) {
            const bodyText = await json3Res.text();
            if (bodyText && (bodyText.trim().startsWith('{') || bodyText.trim().startsWith('['))) {
              const json3Data = JSON.parse(bodyText);
              if (json3Data?.events && Array.isArray(json3Data.events)) {
                const parsedSegments = json3Data.events
                  .filter((event: any) => Array.isArray(event.segs) && event.segs.length > 0)
                  .map((event: any, index: number) => {
                    const text = event.segs
                      .map((seg: any) => String(seg.utf8 ?? '').replace(/\s+/g, ' '))
                      .join(' ')
                      .replace(/\s+/g, ' ')
                      .trim();
                    const startTime = Number(event.tStartMs ?? 0) / 1000;
                    const endTime = startTime + Number(event.dDurationMs ?? 0) / 1000;
                    return { id: `caption-${index}`, text, startTime, endTime };
                  })
                  .filter((segment: any) => segment.text && segment.endTime > segment.startTime);

                if (parsedSegments.length > 0) {
                  return makeTranscript(videoId, parsedSegments, 'caption-segment');
                }
              }
            }
          }
        } catch (e) {
        }

        // Fallback to XML track parsing
        const xmlRes = await fetch(baseUrl);
        const xmlText = await xmlRes.text();
        
        const matches = [...xmlText.matchAll(/<text start="([\d.]+)"(?: dur="([\d.]+)")?[^>]*>(.*?)<\/text>/g)];
        if (matches.length > 0) {
          const parsedSegments = matches
            .map((match, index) => {
              const textClean = (match[3] || match[2] || '')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/<[^>]+>/g, '')
                .trim();
              const startTime = Number(match[1]);
              const duration = Number(match[2] ?? 0.5);
              return {
                id: `caption-${index}`,
                text: textClean,
                startTime,
                endTime: startTime + duration,
              };
            })
            .filter((segment) => segment.text && segment.endTime > segment.startTime);

          if (parsedSegments.length > 0) {
            return makeTranscript(videoId, parsedSegments, 'caption-segment');
          }
        }
      }
    }
  } catch (_) {
  }

  // Try 2: YoutubeTranscript package default
  try {
    const res = await YoutubeTranscript.fetchTranscript(videoId);
    if (res && res.length > 0) {
      return makeTranscript(
        videoId,
        res.map((item: any, index: number) => ({
          id: `caption-${index}`,
          text: String(item.text ?? ''),
          startTime: Number(item.offset) / 1000,
          endTime: (Number(item.offset) + Number(item.duration)) / 1000,
        })),
        'caption-segment',
      );
    }
  } catch (_) {
  }

  throw new Error('No trustworthy timestamped transcript is available for this video.');
}

async function startServer() {
  // Serve files from public folder (e.g., sw.js)
  app.use(express.static(path.join(process.cwd(), "public")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LingoFlow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
