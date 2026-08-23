import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const priority = searchParams.get("priority");
    const sort = searchParams.get("sort") || "desc"; // desc = newest first

    let whereClause: any = {};

    if (session.user.role === "RESIDENT") {
      whereClause.userId = session.user.id;
    }

    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: sort === "desc" ? "desc" : "asc" },
    });

    complaints.sort((a, b) => {
      if (a.status === "Flagged" && b.status !== "Flagged") return -1;
      if (a.status !== "Flagged" && b.status === "Flagged") return 1;
      return 0;
    });

    return NextResponse.json(complaints);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "RESIDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const photo = formData.get("photo") as File | null;

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let photoUrl = null;
    if (photo && photo.size > 0) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      const filename = `${Date.now()}-${photo.name.replace(/\s/g, '_')}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      await writeFile(path.join(uploadDir, filename), buffer);
      photoUrl = `/uploads/${filename}`;
    }

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category,
        photoUrl,
        userId: session.user.id,
      },
    });

    // Create initial history record
    await prisma.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        status: "Open",
        note: "Complaint created.",
        actorId: session.user.id,
      }
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 });
  }
}
