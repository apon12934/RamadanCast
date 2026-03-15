export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'POST',
      },
    });
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server misconfiguration: missing API key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const text = body?.text?.trim();
    const language = body?.language;

    if (!text || (language !== 'en' && language !== 'bn')) {
      return new Response(JSON.stringify({ error: 'Invalid payload: expected text and language (en|bn)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const voiceConfig = language === 'bn'
      ? { languageCode: 'bn-IN', name: 'bn-IN-Wavenet-A' }
      : { languageCode: 'en-US', name: 'en-US-Wavenet-D' };

    const googleResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: voiceConfig,
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0,
          },
        }),
      }
    );

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      return new Response(JSON.stringify({ error: 'Google TTS API failed', details: errorText }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await googleResponse.json();
    if (!data?.audioContent) {
      return new Response(JSON.stringify({ error: 'No audioContent returned from Google TTS' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ audioContent: data.audioContent }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};