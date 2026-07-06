import OpenAI from "openai";

// Groq exposes an OpenAI-compatible Chat Completions API, so the official
// `openai` SDK can talk to it directly by pointing baseURL at Groq instead
// of adding a separate groq-sdk dependency. The client is created lazily
// (not at module scope) so importing this file never throws when
// GROQ_API_KEY is unset, e.g. during Next.js's build-time page data
// collection.
let groq: OpenAI | null = null;

function getGroqClient(): OpenAI {
  if (!groq) {
    groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return groq;
}

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a clinical documentation assistant for licensed therapists at LandStrong Counseling.

You help a therapist turn a raw session transcript or shorthand notes into a well-organized DRAFT progress note. You are not a clinician: you do not diagnose, do not add clinical judgments the therapist did not state, and do not invent details that are not present in the source text.

Write the draft using the DAP format with these three headers exactly: "Data:", "Assessment:", "Plan:". Keep the tone professional, neutral, and concise. Use third person ("Client reported...").

This output is always a draft. It must be reviewed, edited if needed, and explicitly approved by the treating therapist before it becomes part of the client's record. Never include instructions to share this note with the client, and never address the client directly.`;

export interface DraftNoteResult {
  draft: string;
}

export async function draftTherapyNote(sourceText: string): Promise<DraftNoteResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to .env.local to enable AI note drafting."
    );
  }

  const completion = await getGroqClient().chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: 700,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Draft a DAP progress note from the following session transcript / therapist shorthand notes:\n\n"""\n${sourceText}\n"""`,
      },
    ],
  });

  const draft = completion.choices[0]?.message?.content?.trim();
  if (!draft) {
    throw new Error("Groq returned an empty response. Please try again.");
  }

  return { draft };
}
