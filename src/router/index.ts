import userRouter from "./user-router";
import summaryRouter from "./summary-router";
import { Router } from "express";

const router = Router();

router.use("/", userRouter);
router.use("/summary", summaryRouter);

export default router;
