export default async (request, context) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  const tl = url.searchParams.get('tl');
  
  if (!q || !tl) {
    return new Response("Missing parameters", { status: 400 });
  }

  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(q)}`;
  
  try {
    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return new Response(`Google TTS returned ${response.status}`, { status: response.status });
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
};
