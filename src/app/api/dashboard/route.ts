import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const OVERDUE_DAYS = parseInt(process.env.NEXT_PUBLIC_OVERDUE_DAYS || "3", 10);
    const overdueThreshold = new Date();
    overdueThreshold.setDate(overdueThreshold.getDate() - OVERDUE_DAYS);

    const [
      statusCounts,
      categoryCounts,
      overdueComplaints,
    ] = await Promise.all([
      prisma.complaint.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.complaint.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
      prisma.complaint.findMany({
        where: {
          status: { not: "Resolved" },
          createdAt: { lt: overdueThreshold },
        },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" }
      }),
    ]);

    const statusMap = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<string, number>);

    const categoryMap = categoryCounts.reduce((acc, curr) => {
      acc[curr.category] = curr._count.category;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      statusCounts: statusMap,
      categoryCounts: categoryMap,
      overdueComplaints,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
