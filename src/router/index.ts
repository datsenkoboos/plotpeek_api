import userRouter from "./user-router";
import plotpeekRouter from "./plotpeek-router";
import { Router } from "express";

const router = Router();

router.use("/", userRouter);
router.use("/plotpeek", plotpeekRouter);

export default router;
