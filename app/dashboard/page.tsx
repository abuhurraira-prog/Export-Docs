import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId, email: "user@example.com" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/buyers" className="border rounded p-4 hover:shadow">
          <h2 className="text-xl font-semibold">Buyers</h2>
          <p className="text-gray-500">Manage your buyer list</p>
        </Link>
        <Link href="/dashboard/products" className="border rounded p-4 hover:shadow">
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="text-gray-500">Manage your product catalog</p>
        </Link>
        <Link href="/dashboard/shipments" className="border rounded p-4 hover:shadow">
          <h2 className="text-xl font-semibold">Shipments</h2>
          <p className="text-gray-500">Create and manage shipments</p>
        </Link>
      </div>
    </div>
  );
}