import { Router, type IRouter } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "@workspace/db";
import { workEntriesTable, usersTable } from "@workspace/db";
import { CreateWorkEntryBody, UpdateWorkEntryBody } from "@workspace/api-zod";
import { authMiddleware } from "../lib/auth";

const router: IRouter = Router();

router.get("/work-entries", authMiddleware, async (req, res): Promise<void> => {
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  const conditions = [];
  if (startDate) conditions.push(gte(workEntriesTable.date, startDate));
  if (endDate) conditions.push(lte(workEntriesTable.date, endDate));

  const entries = await db
    .select({
      id: workEntriesTable.id,
      date: workEntriesTable.date,
      labourCount: workEntriesTable.labourCount,
      squareMeter: workEntriesTable.squareMeter,
      workingChannel: workEntriesTable.workingChannel,
      createdBy: workEntriesTable.createdBy,
      createdByName: usersTable.name,
      createdAt: workEntriesTable.createdAt,
    })
    .from(workEntriesTable)
    .leftJoin(usersTable, eq(workEntriesTable.createdBy, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(workEntriesTable.date);

  res.json(entries.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })));
});

router.post("/work-entries", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateWorkEntryBody.safeParse(req.body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues?.[0];
    const field = firstIssue?.path?.join(".") || "field";
    const msg = firstIssue?.message || parsed.error.message;
    res.status(400).json({ error: `${field}: ${msg}` });
    return;
  }

  const user = (req as any).user;
  const [entry] = await db.insert(workEntriesTable).values({
    date: parsed.data.date,
    labourCount: parsed.data.labourCount,
    squareMeter: parsed.data.squareMeter,
    workingChannel: parsed.data.workingChannel,
    createdBy: user.userId,
  }).returning();

  res.status(201).json({
    id: entry!.id,
    date: entry!.date,
    labourCount: entry!.labourCount,
    squareMeter: entry!.squareMeter,
    workingChannel: entry!.workingChannel,
    createdBy: entry!.createdBy,
    createdAt: entry!.createdAt.toISOString(),
  });
});

router.patch("/work-entries/:id", authMiddleware, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateWorkEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, any> = {};
  if (parsed.data.date) updateData.date = parsed.data.date;
  if (parsed.data.labourCount !== undefined) updateData.labourCount = parsed.data.labourCount;
  if (parsed.data.squareMeter !== undefined) updateData.squareMeter = parsed.data.squareMeter;
  if (parsed.data.workingChannel) updateData.workingChannel = parsed.data.workingChannel;

  const [entry] = await db.update(workEntriesTable).set(updateData).where(eq(workEntriesTable.id, id)).returning();
  if (!entry) {
    res.status(404).json({ error: "Work entry not found" });
    return;
  }

  res.json({
    id: entry.id,
    date: entry.date,
    labourCount: entry.labourCount,
    squareMeter: entry.squareMeter,
    workingChannel: entry.workingChannel,
    createdBy: entry.createdBy,
    createdAt: entry.createdAt.toISOString(),
  });
});

router.delete("/work-entries/:id", authMiddleware, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const user = (req as any).user;
  const [entry] = await db.select().from(workEntriesTable).where(eq(workEntriesTable.id, id));
  if (!entry) {
    res.status(404).json({ error: "Work entry not found" });
    return;
  }

  if (user.role !== "admin" && entry.createdBy !== user.userId) {
    res.status(403).json({ error: "Not authorized to delete this entry" });
    return;
  }

  await db.delete(workEntriesTable).where(eq(workEntriesTable.id, id));
  res.sendStatus(204);
});

export default router;
