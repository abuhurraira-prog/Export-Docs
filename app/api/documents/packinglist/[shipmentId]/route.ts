import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { renderToStream } from "@react-pdf/renderer";
import PackingListPDF from "@/components/PackingListPDF";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) return new NextResponse("User not found", { status: 404 });

    const { shipmentId } = await params;

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { buyer: true, items: { include: { product: true } } },
    });

    if (!shipment || shipment.userId !== dbUser.id) {
      return new NextResponse("Shipment not found", { status: 404 });
    }

    const items = shipment.items.map(item => ({
      description: item.description || item.product?.name || "",
      quantity: item.quantity,
    }));

    const pdfStream = await renderToStream(PackingListPDF({ shipment, buyer: shipment.buyer, items }));
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream as any) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="packinglist-${shipment.shipmentNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}