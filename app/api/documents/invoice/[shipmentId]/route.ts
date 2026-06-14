import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { renderToStream } from "@react-pdf/renderer";
import InvoicePDF from "@/components/InvoicePDF";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's internal ID
    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // AWAIT params before using its properties
    const { shipmentId } = await params;

    // Fetch shipment with relations
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        buyer: true,
        items: { include: { product: true } },
      },
    });

    if (!shipment || shipment.userId !== dbUser.id) {
      return new NextResponse("Shipment not found", { status: 404 });
    }

    // Prepare data for PDF
    const items = shipment.items.map(item => ({
      description: item.description || item.product?.name || "",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    const pdfStream = await renderToStream(
      InvoicePDF({
        shipment,
        buyer: shipment.buyer,
        user: dbUser,
        items,
      })
    );

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${shipment.shipmentNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}