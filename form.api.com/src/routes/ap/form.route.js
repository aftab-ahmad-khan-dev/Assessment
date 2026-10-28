// routes/registration.routes.js
import express from "express";
import { FormController } from "../../controllers/ap/form.controller.js";
const router = express.Router();

/* ───────────────────────────────────────────────
 * Only these two endpoints — nothing else
 ───────────────────────────────────────────────
*/

// 1. Submit / Resume / Save draft / Finalize
router.post("/submit", FormController.submit);

export default router;
