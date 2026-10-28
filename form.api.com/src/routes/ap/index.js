import express from "express";
import formRoutes from "./form.route.js";
const router = express.Router();

router.use("/", formRoutes);
export default router;
