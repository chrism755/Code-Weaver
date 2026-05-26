import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import projectsRouter from "./projects";
import templatesRouter from "./templates";
import statsRouter from "./stats";
import agentRouter from "./agent";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(projectsRouter);
router.use(templatesRouter);
router.use(statsRouter);
router.use(agentRouter);

export default router;
