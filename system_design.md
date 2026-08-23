# System Design Write-up: Society Maintenance Tracker

## 1. Architecture Overview
The platform is built as a monolith using **Next.js (App Router)**. This allows for seamless integration of server-side API routes and client-side React components within the same repository, eliminating the need for CORS configuration and simplifying deployment. 

**Database Layer**: We use **SQLite** with the **Prisma ORM**. SQLite was chosen for portability, making it easy to test and review locally without setting up a dedicated database server like PostgreSQL. Prisma provides type safety and a robust abstraction over SQL.

## 2. Complaint History Model (Status History)
To guarantee a robust audit trail and full transparency for both residents and admins, the application explicitly separates the current state of a complaint from its lifecycle events. This is achieved using a two-table relational design:

- **`Complaint` Model (Current State):** Acts as the single source of truth for the present status of the issue. It holds mutable fields like `status` (Open, In Progress, Resolved), `priority`, `title`, and `description`.
- **`ComplaintHistory` Model (Audit Trail):** Acts as an **append-only ledger**. For every state transition, a new immutable record is inserted.

**How it works during a status update:**
When an Admin processes an issue (e.g., updating a complaint from "Open" to "In Progress" via `PATCH /api/complaints/:id`), the backend performs a dual operation:
1. **Updates** the `Complaint` table with the new status and current timestamp (`updatedAt`).
2. **Inserts** a new record into the `ComplaintHistory` table linked via `complaintId`.

**Data Captured in History:**
- `status`: The new status that was applied.
- `actorId`: The ID of the Admin who performed the action (ensuring accountability).
- `createdAt`: The exact timestamp of the transition.
- `note`: An optional text field where the Admin can leave a justification or update message (e.g., "Plumber is scheduled for tomorrow").

**Design Benefits:**
- **Transparency & Trust:** Residents can view a chronological timeline of their complaint, exactly like tracking a package delivery.
- **Accountability:** Every action is tied to an `actorId`, meaning the system always knows *who* changed the status and *when*.
- **Analytics Ready:** This structure makes it trivial to calculate metrics like "average time to resolution" or "time spent in 'In Progress' state" in the future.

## 3. Overdue Detection
Overdue detection is handled dynamically rather than via a cron job that updates the database. 
In the `GET /api/dashboard` route, we query for complaints where the `status` is not `Resolved` and the `createdAt` timestamp is less than a configurable threshold (currently 3 days ago).

```javascript
const overdueThreshold = new Date();
overdueThreshold.setDate(overdueThreshold.getDate() - 3);

const overdueComplaints = await prisma.complaint.findMany({
  where: {
    status: { not: "Resolved" },
    createdAt: { lt: overdueThreshold },
  }
});
```
This approach guarantees that the dashboard always displays real-time overdue metrics without relying on background job scheduling. The results are surfaced at the top of the Admin dashboard with distinct visual alerts.

## 4. Photo Handling
When a Resident raises a complaint, they can attach a photo. We handle this via `multipart/form-data` in the `POST /api/complaints` route. The Next.js API route reads the file buffer and saves it to the local `public/uploads/` directory. The file name is appended with a timestamp to prevent collisions. 

The `photoUrl` is then saved in the database as a relative path (`/uploads/filename.jpg`), which Next.js automatically serves as static content from the `public` folder. (For a production environment, this logic can easily be swapped to use Cloudinary or an S3 bucket by modifying the API route).

## 5. Notification Flow
Email notifications are integrated using the **Resend API**.

The notification flow is triggered in two main scenarios:
1. **Status Updates**: In `PATCH /api/complaints/:id`, if the status changes, we fetch the Resident's email and trigger the Resend API to send an email with the update details and admin notes.
2. **Important Notices**: In `POST /api/notices`, if the `isImportant` flag is true, we query all users where `role === "RESIDENT"` and dispatch a batch of emails using Resend.

Since email dispatch can be blocking, in a highly scaled production application, we would push these email tasks into a background queue (like BullMQ or an AWS SQS queue). For this prototype, we await them directly in the route handler.
