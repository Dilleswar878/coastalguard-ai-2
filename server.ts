import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json({ limit: '12mb' }));

// Health / Status check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'CoastalGuard AI Telemetry Hub',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// In-memory sliding window rate limiter (20 requests per minute per IP) with memory eviction
const requestRateMap = new Map<string, number[]>();
const MAX_TRACKED_IPS = 5000;

function pruneRateLimits(): void {
  const now = Date.now();
  const windowMs = 60 * 1000;
  for (const [ip, timestamps] of requestRateMap.entries()) {
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length === 0) {
      requestRateMap.delete(ip);
    } else {
      requestRateMap.set(ip, valid);
    }
  }
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;

  // Evict if map exceeds safety threshold
  if (requestRateMap.size > MAX_TRACKED_IPS) {
    pruneRateLimits();
  }

  const existing = requestRateMap.get(ip) || [];
  const validTimestamps = existing.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return false;
  }

  validTimestamps.push(now);
  requestRateMap.set(ip, validTimestamps);
  return true;
}

const ALLOWED_CATEGORIES = new Set([
  'plastic_waste',
  'oil_spill',
  'sewage_wastewater',
  'fishing_nets',
  'algal_bloom',
  'distressed_wildlife',
  'other_environmental',
]);

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_SEVERITIES = new Set(['Low', 'Medium', 'High', 'Critical']);

// Gemini Analysis API
app.post('/api/gemini/analyze-incident', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before sending further telemetry requests.',
      isFallback: true,
      modelUsed: 'CoastalGuard Heuristic Engine (Offline Fallback)',
    });
  }

  const { title, category, description, locationName, perceivedSeverity, wildlifeObservations, imageBase64, mimeType } = req.body;

  // Input Validation
  if (title !== undefined && (typeof title !== 'string' || title.length > 200)) {
    return res.status(400).json({ error: 'Invalid title: must be a string up to 200 characters.' });
  }

  if (category !== undefined && !ALLOWED_CATEGORIES.has(category)) {
    return res.status(400).json({ error: 'Invalid incident category specified.' });
  }

  if (description !== undefined && (typeof description !== 'string' || description.length > 5000)) {
    return res.status(400).json({ error: 'Invalid description: must be a string up to 5000 characters.' });
  }

  if (locationName !== undefined && (typeof locationName !== 'string' || locationName.length > 200)) {
    return res.status(400).json({ error: 'Invalid locationName: must be a string up to 200 characters.' });
  }

  if (perceivedSeverity !== undefined && !ALLOWED_SEVERITIES.has(perceivedSeverity)) {
    return res.status(400).json({ error: 'Invalid perceivedSeverity value.' });
  }

  if (mimeType !== undefined && mimeType !== '' && !ALLOWED_MIME_TYPES.has(mimeType)) {
    return res.status(400).json({ error: 'Invalid image mimeType. Allowed: image/jpeg, image/png, image/webp.' });
  }

  if (imageBase64 !== undefined && imageBase64 !== '') {
    if (typeof imageBase64 !== 'string' || imageBase64.length > 20 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image payload exceeds allowable size limit.' });
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      isFallback: true,
      message: 'GEMINI_API_KEY not configured or using placeholder in server environment.',
      modelUsed: 'CoastalGuard Heuristic Engine (Offline Fallback)',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // If an image was uploaded, include it for real multimodal computer vision analysis!
    if (imageBase64 && mimeType) {
      // Clean base64 header if present
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const systemPrompt = `You are CoastalGuard AI, an expert marine environmental intelligence and coastal hazard assessment engine.
You are analyzing a citizen report of coastal pollution or marine ecological disturbance.

CRITICAL SAFETY & SCIENTIFIC PRINCIPLES:
1. Avoid inventing observations that are not visible or described.
2. Express uncertainty when evidence is insufficient.
3. Distinguish suspected pollution from confirmed pollution.
4. Never present a severity estimate as an official scientific measurement.
5. Never identify a chemical substance with certainty from an image or report alone.
6. Always recommend contacting appropriate local emergency or environmental authorities for hazardous incidents.
7. NEVER instruct citizens to approach, touch, sample, or clean hazardous spills or entangled wildlife.
8. Avoid unsupported claims about wildlife mortality or health impacts.

Analyze the report and return a structured JSON response according to the schema.`;

    const userPrompt = `INCIDENT REPORT DETAILS:
- Title: ${title || 'Untitled Report'}
- Stated Category: ${category || 'Unknown'}
- Description: ${description || 'No description provided'}
- Location: ${locationName || 'Unknown coastal zone'}
- Perceived Severity: ${perceivedSeverity || 'Not specified'}
- Wildlife / Environmental observations: ${wildlifeObservations || 'None noted'}
${imageBase64 ? 'An image was attached. Analyze the visual evidence for sheen, discoloration, debris density, ecological perimeter, and physical hazards.' : 'No photograph was attached; assess based solely on descriptive tokens.'}

Evaluate the incident category, severity (Low, Medium, High, or Critical), confidence (0-100), environmental impact, affected ecosystems, immediate precautions, recommended cleanup/investigation actions, suggested responsible agency, priority (Low, Medium, High, Immediate), explanation, and limitations.`;

    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'Confirmed category: plastic_waste, oil_spill, sewage_wastewater, fishing_nets, algal_bloom, distressed_wildlife, other_environmental',
            },
            severity: {
              type: Type.STRING,
              description: 'Severity level: Low, Medium, High, Critical',
            },
            confidence: {
              type: Type.INTEGER,
              description: 'Confidence score from 0 to 100 based on evidence quality',
            },
            environmentalImpact: {
              type: Type.STRING,
              description: 'Realistic ecological impact summary',
            },
            affectedEcosystems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific coastal and marine habitats impacted',
            },
            immediatePrecautions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Safety warnings and safety perimeter guidelines for citizens and responders',
            },
            recommendedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Professional cleanup and investigation actions for environmental authorities',
            },
            suggestedAgency: {
              type: Type.STRING,
              description: 'Appropriate environmental response agency or jurisdiction',
            },
            priority: {
              type: Type.STRING,
              description: 'Response priority: Low, Medium, High, Immediate',
            },
            explanation: {
              type: Type.STRING,
              description: 'Objective explanation of the assessment based on supplied evidence',
            },
            limitations: {
              type: Type.STRING,
              description: 'Transparent notation of missing evidence, uncertainty, or requirements for lab verification',
            },
          },
          required: [
            'category',
            'severity',
            'confidence',
            'environmentalImpact',
            'affectedEcosystems',
            'immediatePrecautions',
            'recommendedActions',
            'suggestedAgency',
            'priority',
            'explanation',
            'limitations',
          ],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      throw new Error('Gemini model returned empty response.');
    }

    const assessment = JSON.parse(jsonText);

    return res.json({
      isFallback: false,
      modelUsed: 'gemini-3.8-flash',
      assessment,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown Gemini error';
    console.error('[CoastalGuard AI] Gemini API execution error (logged safely server-side):', errorMsg);
    return res.status(200).json({
      isFallback: true,
      message: 'Gemini telemetry service encountered an operational condition. Calibrated heuristic fallback matrix engaged.',
      modelUsed: 'CoastalGuard Heuristic Engine (Offline Fallback)',
    });
  }
});

// Production or Dev Vite mounting
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Dev mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[CoastalGuard AI] Server running on port ${PORT}`);
  });
}

startServer();
