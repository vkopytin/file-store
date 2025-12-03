import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, ctx: unknown) {
  try {
    const { id } = await (ctx as { params: { id: string } }).params;
    const media = await prisma.documents.findUnique({
      where: { id },
    });
    if (!media) {
      return Response.json({ error: 'Media not found' }, { status: 404 });
    }
    const headers = new Headers({
        'Content-Length': media.data.length.toString(),
        'Content-Type': media.contenttype,
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `inline; filename=${media.filename}`,
      });

    return new Response(media.data, { status: 200, headers });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch media' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Close the Prisma client connection
  }
}
