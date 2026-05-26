export type GeminiTextResult = {
  text: string;
};

const TEXT_MODEL = "gemini-2.5-flash-preview-09-2025";
const TTS_MODEL  = "gemini-2.5-flash-preview-tts";

type GeminiTextResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

type GeminiTtsResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ inlineData?: { data?: string } }> };
  }>;
};

export async function callGemini(
  prompt: string,
  apiKey: string,
  systemPrompt = "You are a neighborhood RW assistant.",
  model = TEXT_MODEL
): Promise<GeminiTextResult> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
        }),
      }
    );

    // ✅ Check if response is OK
    if (!response.ok) {
      console.error(`[GEMINI] Request failed with status ${response.status}`);
      throw new Error(`Gemini text request failed: ${response.status}`);
    }

    // ✅ Check Content-Type header
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[GEMINI] Invalid Content-Type: ${contentType}. Expected application/json`);
      throw new Error('Invalid response content type from Gemini API');
    }

    // ✅ Parse JSON safely
    let data: GeminiTextResponse;
    try {
      data = (await response.json()) as GeminiTextResponse;
    } catch (parseError) {
      console.error('[GEMINI] Failed to parse JSON response:', parseError);
      throw new Error('Failed to parse Gemini API response as JSON');
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return { text };
  } catch (error) {
    console.error('[GEMINI] Error calling Gemini API:', error);
    // Return safe fallback instead of throwing
    return { text: "" };
  }
}

export async function playTTS(
  text: string,
  apiKey: string,
  model = TTS_MODEL
): Promise<void> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
            },
          },
        }),
      }
    );

    // ✅ Check if response is OK
    if (!response.ok) {
      console.error(`[GEMINI TTS] Request failed with status ${response.status}`);
      throw new Error(`Gemini TTS request failed: ${response.status}`);
    }

    // ✅ Check Content-Type header
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[GEMINI TTS] Invalid Content-Type: ${contentType}. Expected application/json`);
      throw new Error('Invalid response content type from Gemini API');
    }

    // ✅ Parse JSON safely
    let data: GeminiTtsResponse;
    try {
      data = (await response.json()) as GeminiTtsResponse;
    } catch (parseError) {
      console.error('[GEMINI TTS] Failed to parse JSON response:', parseError);
      throw new Error('Failed to parse Gemini TTS API response as JSON');
    }

    const base64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? "";
    if (!base64) {
      console.warn('[GEMINI TTS] No audio data in response');
      return;
    }

    const bytes = new Uint8Array(
      atob(base64).split("").map((c) => c.charCodeAt(0))
    );
    const sampleRate = 24000;
    const buf  = new ArrayBuffer(44);
    const view = new DataView(buf);
    view.setUint32(0,  0x46464952, true);
    view.setUint32(4,  36 + bytes.length, true);
    view.setUint32(8,  0x45564157, true);
    view.setUint32(12, 0x20746d66, true);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1,          true);
    view.setUint16(22, 1,          true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2,          true);
    view.setUint16(34, 16,         true);
    view.setUint32(36, 0x61746164, true);
    view.setUint32(40, bytes.length, true);

    const blob = new Blob([buf, bytes], { type: "audio/wav" });
    new Audio(URL.createObjectURL(blob)).play();
  } catch (error) {
    console.error('[GEMINI TTS] Error playing TTS:', error);
    // Fail silently - audio playback is non-critical
  }
}
