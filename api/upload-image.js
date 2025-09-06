import { put } from '@vercel/blob';

export default async function POST(request) {
  try {
    const file = request.files.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded.' }), {
        status: 400,
      });
    }

    const blob = await put(file.name, file, {
      access: 'public', // يجعل الملفات قابلة للوصول للجميع
    });

    return new Response(JSON.stringify(blob), {
      status: 200,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload file.' }), {
      status: 500,
    });
  }
}
