import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { buyerId, shipmentNumber, shipmentDate, proformaNumber, lcNumber, portOfLoading, portOfDischarge, incoterm, notes, subtotal, discount, shippingCharge, totalAmount, items } = body;

    // You'd also need userId from auth. We'll add auth check later.
    // For now, assume we get userId from body or session. We'll fix.
    // Quick fix: get from auth inside this route. Let me add.

    const { auth } = await import("@clerk/nextjs/server");
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get internal user ID
    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const shipment = await prisma.shipment.create({
      data: {
        userId: dbUser.id,
        buyerId,
        shipmentNumber,
        shipmentDate: new Date(shipmentDate),
        proformaNumber,
        lcNumber,
        portOfLoading,
        portOfDischarge,
        incoterm,
        notes,
        subtotal,
        discount,
        shippingCharge,
        totalAmount,
        status: "DRAFT",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            description: item.description,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}