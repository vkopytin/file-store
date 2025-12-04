import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.log('Failed to verify session')
  }
}

export async function POST(request: Request) {
  const accessToken = request.headers.get('authorization')?.split(' ')?.[1];
  const decodedToken = await decrypt(accessToken);
  if (!accessToken || !decodedToken) {
    return Response.json({
      message: 'Unauthorized',
    }, {
      status: 401,
    });
  }

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
