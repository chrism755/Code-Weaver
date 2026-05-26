import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, projectsTable, usersTable, activityTable } from "@workspace/db";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  CreateProjectBody,
  ListProjectsQueryParams,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  ForkProjectParams,
  ListPublicProjectsQueryParams,
} from "@workspace/api-zod";

const router = Router();

function mapProject(p: typeof projectsTable.$inferSelect, username?: string | null) {
  return {
    ...p,
    username: username ?? null,
    lastRunAt: p.lastRunAt ? p.lastRunAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

router.get("/projects", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.clerkId, clerkId) });
  if (!user) return res.status(404).json({ error: "User not found" });

  const params = ListProjectsQueryParams.safeParse(req.query);
  const { type, search } = params.success ? params.data : {};

  let query = db.select().from(projectsTable).where(eq(projectsTable.userId, user.id));

  const conditions = [eq(projectsTable.userId, user.id)];
  if (type) conditions.push(eq(projectsTable.type, type));
  if (search) conditions.push(ilike(projectsTable.name, `%${search}%`));

  const projects = await db
    .select()
    .from(projectsTable)
    .where(and(...conditions))
    .orderBy(desc(projectsTable.updatedAt));

  return res.json(projects.map(p => mapProject(p, user.username)));
});

router.post("/projects", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.clerkId, clerkId) });
  if (!user) return res.status(404).json({ error: "User not found" });

  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const { name, description, type, language, isPublic } = parsed.data;
  const id = randomUUID();
  const subdomain = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${id.slice(0, 6)}`;

  const [project] = await db.insert(projectsTable).values({
    id,
    name,
    description: description ?? null,
    type,
    language: language ?? null,
    userId: user.id,
    isPublic: isPublic ?? false,
    subdomain,
  }).returning();

  await db.insert(activityTable).values({
    id: randomUUID(),
    type: "created",
    userId: user.id,
    projectId: project.id,
    projectName: project.name,
    projectType: project.type,
  });

  await db.update(usersTable).set({ projectCount: user.projectCount + 1 }).where(eq(usersTable.id, user.id));

  return res.status(201).json(mapProject(project, user.username));
});

router.get("/projects/public", async (req, res) => {
  const params = ListPublicProjectsQueryParams.safeParse(req.query);
  const { type, search } = params.success ? params.data : {};

  const conditions = [eq(projectsTable.isPublic, true)];
  if (type) conditions.push(eq(projectsTable.type, type));
  if (search) conditions.push(ilike(projectsTable.name, `%${search}%`));

  const projects = await db
    .select({ project: projectsTable, username: usersTable.username })
    .from(projectsTable)
    .leftJoin(usersTable, eq(projectsTable.userId, usersTable.id))
    .where(and(...conditions))
    .orderBy(desc(projectsTable.forkCount))
    .limit(50);

  return res.json(projects.map(({ project, username }) => mapProject(project, username)));
});

router.get("/projects/:id", async (req, res) => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid id" });

  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, params.data.id),
  });
  if (!project) return res.status(404).json({ error: "Not found" });

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, project.userId) });
  return res.json(mapProject(project, user?.username));
});

router.patch("/projects/:id", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid id" });

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.clerkId, clerkId) });
  if (!user) return res.status(404).json({ error: "User not found" });

  const project = await db.query.projectsTable.findFirst({
    where: and(eq(projectsTable.id, params.data.id), eq(projectsTable.userId, user.id)),
  });
  if (!project) return res.status(404).json({ error: "Not found" });

  const body = UpdateProjectBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid request" });

  const [updated] = await db
    .update(projectsTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  await db.insert(activityTable).values({
    id: randomUUID(),
    type: "updated",
    userId: user.id,
    projectId: updated.id,
    projectName: updated.name,
    projectType: updated.type,
  });

  return res.json(mapProject(updated, user.username));
});

router.delete("/projects/:id", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid id" });

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.clerkId, clerkId) });
  if (!user) return res.status(404).json({ error: "User not found" });

  await db.delete(projectsTable).where(
    and(eq(projectsTable.id, params.data.id), eq(projectsTable.userId, user.id))
  );

  return res.status(204).send();
});

router.post("/projects/:id/fork", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const params = ForkProjectParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid id" });

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.clerkId, clerkId) });
  if (!user) return res.status(404).json({ error: "User not found" });

  const original = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, params.data.id),
  });
  if (!original) return res.status(404).json({ error: "Project not found" });

  const id = randomUUID();
  const subdomain = `${original.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${id.slice(0, 6)}`;

  const [forked] = await db.insert(projectsTable).values({
    id,
    name: `${original.name} (fork)`,
    description: original.description,
    type: original.type,
    language: original.language,
    userId: user.id,
    isPublic: false,
    subdomain,
  }).returning();

  await db.update(projectsTable).set({ forkCount: original.forkCount + 1 }).where(eq(projectsTable.id, original.id));

  await db.insert(activityTable).values({
    id: randomUUID(),
    type: "forked",
    userId: user.id,
    projectId: forked.id,
    projectName: forked.name,
    projectType: forked.type,
  });

  return res.status(201).json(mapProject(forked, user.username));
});

export default router;
