import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = 4000;
const USER_ID = "test-user-123";

app.use(cors());
app.use(express.json());

/* ---------- Routines ---------- */

app.get("/routines/:userId", async (req, res) => {
  const routines = await prisma.routine.findMany({
    where: { userId: req.params.userId },
    include: { actions: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(routines);
});

app.post("/routines", async (req, res) => {
  const { name, enabled, schedule, actions } = req.body;

  const routine = await prisma.routine.create({
    data: {
      userId: USER_ID,
      name,
      enabled,
      time: schedule.time,
      days: schedule.days,
      actions: {
        create: actions.map((a, i) => ({
          type: a.type,
          value: a.value ?? a.command ?? "",
          args: a.args ?? [],
          order: i
        }))
      }
    },
    include: { actions: true }
  });

  res.json(routine);
});

app.patch("/routines/:id", async (req, res) => {
  const { enabled, lastRunAt } = req.body;

  const routine = await prisma.routine.update({
    where: { id: req.params.id },
    data: { enabled, lastRunAt }
  });

  res.json(routine);
});

app.delete("/routines/:id", async (req, res) => {
  await prisma.action.deleteMany({ where: { routineId: req.params.id } });
  await prisma.log.deleteMany({ where: { routineId: req.params.id } });
  await prisma.routine.delete({ where: { id: req.params.id } });

  res.json({ ok: true });
});

/* ---------- Logs ---------- */

app.get("/logs/:userId", async (req, res) => {
  const logs = await prisma.log.findMany({
    where: { userId: req.params.userId },
    orderBy: { createdAt: "desc" }
  });
  res.json(logs);
});

app.post("/logs/:userId", async (req, res) => {
  const { routineId, status, message } = req.body;

  const log = await prisma.log.create({
    data: {
      userId: req.params.userId,
      routineId,
      actionType: "routine",
      status,
      message
    }
  });

  res.json(log);
});

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
