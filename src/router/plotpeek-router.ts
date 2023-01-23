import plotpeekController from "../controllers/plotpeek-controller";
import authMiddleware from "../middlewares/auth-middleware";
import { body, param, query } from "express-validator";
import { Router } from "express";
import validationMiddleware from "../middlewares/validation-middleware";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  body("name").notEmpty().bail().isLength({ max: 255 }).bail(),
  body("author").notEmpty().bail().isLength({ max: 255 }).bail(),
  body("content").notEmpty().bail(),
  body("description").if(body("description").exists()).isLength({ max: 255 }).bail(),
  body("style").if(body("style").exists()).isLength({ max: 255 }).bail(),
  body("volume").notEmpty().bail().isDecimal().bail(),
  validationMiddleware,
  plotpeekController.createPlotpeek
);

router.post(
  "/generate",
  authMiddleware,
  body("name").notEmpty().bail().isLength({ max: 255 }).bail(),
  body("author").notEmpty().bail().isLength({ max: 255 }).bail(),
  body("volume").notEmpty().bail().isInt({ min: 1, max: 3 }).bail(),
  validationMiddleware,
  plotpeekController.generatePlotpeekContent
);

router.get(
  "/",
  query("viewed").if(query("viewed").exists()).isDecimal().bail(),
  validationMiddleware,
  plotpeekController.getPlotpeeks
);

router.get("/:id", param("id").isDecimal().bail(), validationMiddleware, plotpeekController.getIndividualPlotpeek);

router.put(
  "/:id/like",
  authMiddleware,
  param("id").isDecimal().bail(),
  validationMiddleware,
  plotpeekController.togglePlotpeekLike
);

export default router;
