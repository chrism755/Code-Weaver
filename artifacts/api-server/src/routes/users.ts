import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { GetMeResponse, UpdateMeBody } from "@workspace/api-zod";

const router = Router();

router.get("/users/me", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let user = await db.query.usersTable.findFirst({
    where: eq(usersTable.clerkId, clerkId),
  });

  if (!user) {
    const username = `user_${randomUUID().replace(/-/g, "").slice(0, 8)}`;
    const id = randomUUID();
    await db.insert(usersTable).values({
      id,
      clerkId,
      username,
      email: `${username}@placeholder.dev`,
      plan: "free",
    });
    user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    });
  }

  const parsed = GetMeResponse.safeParse({
    ...user,
    createdAt: user!.createdAt.toISOString(),
  });
  if (!parsed.success) return res.status(500).json({ error: "Parse error" });
  return res.json(parsed.data);
});

router.patch("/users/me", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.clerkId, clerkId),
  });
  if (!user) return res.status(404).json({ error: "User not found" });

  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.clerkId, clerkId))
    .returning();

  return res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
