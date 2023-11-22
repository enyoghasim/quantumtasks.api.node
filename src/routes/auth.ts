import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import {
  userLoginValidationRules,
  userSignupValidationRules,
} from "../validators/authValidators";

const router = Router();

router.post("/signup", userSignupValidationRules, AuthController.signup);
router.post("/login", userLoginValidationRules, AuthController.login);

export default router;
