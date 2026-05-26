import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, projectsTable, usersTable, activityTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";

const router = Router();

router.get("/stats/dashboard", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.clerkId, clerkId) });
  if (!user) return res.json({ totalProjects: 0, publicProjects: 0, totalForks: 0, recentActivity: 0 });

  const allProjects = await db.select().from(projectsTable).where(eq(projectsTable.userId, user.id));
  const totalProjects = allProjects.length;
  const publicProjects = allProjects.filter(p => p.isPublic).length;
  const totalForks = allProjects.reduce((sum, p) => sum + p.forkCount, 0);

  const recentActivity = await db
    .select()
    .from(activityTable)
    .where(eq(activityTable.userId, user.id))
    .orderBy(desc(activityTable.createdAt))
    .limit(10);

  return res.json({
    totalProjects,
    publicProjects,
    totalForks,
    recentActivity: recentActivity.length,
  });
});

router.get("/stats/activity", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.clerkId, clerkId) });
  if (!user) return res.json([]);

  const activity = await db
    .select()
    .from(activityTable)
    .where(eq(activityTable.userId, user.id))
    .orderBy(desc(activityTable.createdAt))
    .limit(20);

  return res.json(activity.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  })));
});

export default router;
