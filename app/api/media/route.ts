import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentPage = parseInt(searchParams.get('page') || '1', 10); // Default to page 1 if not provided
    const limit = parseInt(searchParams.get('limit') || '10', 10); // Default to 10 items per page if not provided

    // Calculate the 'skip' and 'take' values
    const skip = (currentPage - 1) * limit;
    const take = limit;
    const items = await prisma.documents.findMany({
      orderBy: {
        createdat: 'desc',
      },
      skip,
      take,
    });

    const totalRecords = await prisma.documents.count();
    const totalPages = Math.ceil(totalRecords / limit);
    const results = items.map((item) => ({
      id: item.id,
      fileName: item.filename,
      contentType: item.contenttype,
      createdAt: item.createdat,
    }));

    return Response.json(
      {
        results,
        totalRecords,
        totalPages,
        currentPage
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching photos:", error);
    return Response.json({ error: "Failed to fetch photos" }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Close the Prisma client connection
  }
}
