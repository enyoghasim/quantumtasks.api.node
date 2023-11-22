import { Router } from "express";

import Auth from "./auth";

const router = Router();

router.use("/auth", Auth);

export default router;
