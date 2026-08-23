import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: [
        { isImportant: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    return NextResponse.json(notices);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, isImportant } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        isImportant: isImportant || false,
        authorId: session.user.id,
      },
    });

    if (isImportant) {
      // Send email to all residents
      const residents = await prisma.user.findMany({
        where: { role: "RESIDENT" },
        select: { email: true, name: true },
      });
      
      // In a real app, you would send this in a batch or queue
      for (const resident of residents) {
        await sendEmail({
          to: resident.email,
          subject: `Important Notice: ${title}`,
          html: `<p>Dear ${resident.name},</p><p>${content}</p><p>Regards,<br>Society Admin</p>`,
        });
      }
    }

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
  }
}
