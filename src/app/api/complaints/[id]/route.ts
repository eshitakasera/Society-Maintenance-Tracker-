import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        history: { orderBy: { createdAt: "desc" } }
      },
    });

    if (!complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (session.user.role === "RESIDENT" && complaint.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, priority, note } = await req.json();

    const existingComplaint = await prisma.complaint.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingComplaint) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updatedData: any = {};
    if (status) updatedData.status = status;
    if (priority) updatedData.priority = priority;

    const complaint = await prisma.complaint.update({
      where: { id },
      data: updatedData,
    });

    // Record history if status changed
    if (status && status !== existingComplaint.status) {
      await prisma.complaintHistory.create({
        data: {
          complaintId: complaint.id,
          status,
          note: note || `Status updated to ${status}`,
          actorId: session.user.id,
        }
      });

      // Send email to resident
      await sendEmail({
        to: existingComplaint.user.email,
        subject: `Update on your complaint: ${complaint.title}`,
        html: `<p>Dear ${existingComplaint.user.name},</p>
               <p>The status of your complaint "<strong>${complaint.title}</strong>" has been updated to <strong>${status}</strong>.</p>
               ${note ? `<p>Admin Note: ${note}</p>` : ''}
               <p>Regards,<br>Society Admin</p>`
      });
    } else if (note) {
      // Just a note added without status change, we can still record it
      await prisma.complaintHistory.create({
        data: {
          complaintId: complaint.id,
          status: complaint.status, // keep current status
          note,
          actorId: session.user.id,
        }
      });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
