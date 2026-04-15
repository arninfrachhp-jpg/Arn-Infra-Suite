import { Router, type IRouter } from "express";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { workEntriesTable, usersTable } from "@workspace/db";
import { authMiddleware, adminOnly } from "../lib/auth";

const router: IRouter = Router();

router.get("/reports/summary", authMiddleware, adminOnly, async (req, res): Promise<void> => {
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

  const totalLabour = entries.reduce((sum, e) => sum + e.labourCount, 0);
  const totalSquareMeter = entries.reduce((sum, e) => sum + e.squareMeter, 0);

  res.json({
    totalEntries: entries.length,
    totalLabour,
    totalSquareMeter,
    entries: entries.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })),
  });
});

router.get("/reports/export-excel", authMiddleware, adminOnly, async (req, res): Promise<void> => {
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
      createdByName: usersTable.name,
      createdAt: workEntriesTable.createdAt,
    })
    .from(workEntriesTable)
    .leftJoin(usersTable, eq(workEntriesTable.createdBy, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(workEntriesTable.date);

  let csv = "Date,Labour Count,Square Meter,Working Channel,Created By,Created At\n";
  for (const e of entries) {
    csv += `${e.date},${e.labourCount},${e.squareMeter},"${e.workingChannel}","${e.createdByName || ""}",${e.createdAt.toISOString()}\n`;
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=work-entries.csv");
  res.send(csv);
});

router.get("/reports/export-pdf", authMiddleware, adminOnly, async (req, res): Promise<void> => {
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
      createdByName: usersTable.name,
    })
    .from(workEntriesTable)
    .leftJoin(usersTable, eq(workEntriesTable.createdBy, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(workEntriesTable.date);

  const totalLabour = entries.reduce((sum, e) => sum + e.labourCount, 0);
  const totalSquareMeter = entries.reduce((sum, e) => sum + e.squareMeter, 0);

  let html = `<html><head><style>
    body{font-family:Arial;margin:20px}
    h1{color:#1a4d8f;text-align:center}
    table{width:100%;border-collapse:collapse;margin-top:20px}
    th{background:#1a4d8f;color:white;padding:10px;text-align:left}
    td{border:1px solid #ddd;padding:8px}
    tr:nth-child(even){background:#f9f9f9}
    .summary{margin-top:20px;font-size:16px}
    .summary span{font-weight:bold;color:#1a4d8f}
  </style></head><body>
    <h1>ARN INFRA - Work Report</h1>
    ${startDate || endDate ? `<p>Period: ${startDate || "Start"} to ${endDate || "Present"}</p>` : ""}
    <table>
      <tr><th>Date</th><th>Labour</th><th>Sq. Meter</th><th>Channel</th><th>Created By</th></tr>`;

  for (const e of entries) {
    html += `<tr><td>${e.date}</td><td>${e.labourCount}</td><td>${e.squareMeter}</td><td>${e.workingChannel}</td><td>${e.createdByName || ""}</td></tr>`;
  }

  html += `</table>
    <div class="summary">
      <p>Total Entries: <span>${entries.length}</span></p>
      <p>Total Labour: <span>${totalLabour}</span></p>
      <p>Total Square Meter: <span>${totalSquareMeter}</span></p>
    </div>
  </body></html>`;

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Content-Disposition", "attachment; filename=work-report.html");
  res.send(html);
});

router.get("/dashboard/stats", authMiddleware, async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0]!;
  const monthStart = today.slice(0, 7) + "-01";

  const todayEntries = await db
    .select({ labourCount: workEntriesTable.labourCount, squareMeter: workEntriesTable.squareMeter })
    .from(workEntriesTable)
    .where(eq(workEntriesTable.date, today));

  const monthEntries = await db
    .select({ labourCount: workEntriesTable.labourCount, squareMeter: workEntriesTable.squareMeter })
    .from(workEntriesTable)
    .where(and(gte(workEntriesTable.date, monthStart), lte(workEntriesTable.date, today)));

  const totalCount = await db.select({ count: sql<number>`count(*)` }).from(workEntriesTable);

  const recentEntries = await db
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
    .orderBy(sql`${workEntriesTable.createdAt} DESC`)
    .limit(5);

  res.json({
    todayLabour: todayEntries.reduce((sum, e) => sum + e.labourCount, 0),
    todaySquareMeter: todayEntries.reduce((sum, e) => sum + e.squareMeter, 0),
    monthLabour: monthEntries.reduce((sum, e) => sum + e.labourCount, 0),
    monthSquareMeter: monthEntries.reduce((sum, e) => sum + e.squareMeter, 0),
    totalEntries: Number(totalCount[0]?.count || 0),
    recentEntries: recentEntries.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })),
  });
});

export default router;
