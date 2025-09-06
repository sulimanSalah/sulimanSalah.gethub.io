import { put } from '@vercel/blob';

export default async function handleUpload(request) {
  try { 
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!request.body) {
      throw new Error('No file data provided.');
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
        throw new Error('File not found in form data.');
    }

    const blob = await put(file.name, file, {
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
