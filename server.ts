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

app.use(express.json({ limit: '25mb' }));

// Health / Status check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'CoastalGuard AI Telemetry Hub',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// Gemini Analysis API
app.post('/api/gemini/analyze-incident', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      isFallback: true,
      message: 'GEMINI_API_KEY not configured or using placeholder in server environment.',
      modelUsed: 'CoastalGuard Heuristic Engine (Offline Fallback)',
    });
  }

  const { title, category, description, locationName, perceivedSeverity, wildlifeObservations, imageBase64, mimeType } = req.body;

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
    console.error('Gemini API execution error:', errorMsg);
    return res.status(200).json({
      isFallback: true,
      message: `Gemini API execution error: ${errorMsg}`,
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
