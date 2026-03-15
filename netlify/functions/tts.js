const GOOGLE_TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'TTS is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const text = String(body?.text || '').trim();
    const language = body?.language === 'en' ? 'en' : 'bn';

    if (!text) {
      return new Response(JSON.stringify({ error: 'Missing text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const voiceConfig = language === 'en'
      ? { languageCode: 'en-US', name: 'en-US-Wavenet-D' }
      : { languageCode: 'bn-BD', name: 'bn-BD-Wavenet-A' };

    const googleResponse = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: voiceConfig,
        audioConfig: { audioEncoding: 'MP3' },
      }),
    });

    const googleData = await googleResponse.json();

    if (!googleResponse.ok || !googleData?.audioContent) {
      console.error('[TTS] Google API error:', googleData);
      return new Response(JSON.stringify({ error: 'Google TTS request failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ audioContent: googleData.audioContent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[TTS] Function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
