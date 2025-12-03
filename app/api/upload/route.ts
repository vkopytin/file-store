import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return new Response('No file uploaded', { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const binaryData = new Uint8Array(buffer);

  await prisma.documents.create({
    data: {
      filename: file.name,
      contenttype: file.type,
      data: binaryData,
    },
  });

  return new Response(JSON.stringify({
    ok: true,
    message: 'File uploaded successfully'
  }), { status: 200 });
}
