import { put } from '@vercel/blob';

export default async function handleUpload(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    const blob = await put(filename, request.body, {
      access: 'public',
    });

    return new Response(JSON.stringify(blob), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
