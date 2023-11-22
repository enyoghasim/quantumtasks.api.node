import { ValidationChain, check } from "express-validator";

export const userSignupValidationRules: ValidationChain[] = [
  check("name")
    .customSanitizer((value: string) => value?.trim())
    .notEmpty()
    .withMessage("Name is required.")
    .bail()
    .isString()
    .withMessage("Name must be a string.")
    .matches(/^[a-zA-Z ]+$/)
    .withMessage("Name must contain only alphabets."),
  check("email")
    .customSanitizer((value: string) => value?.trim()?.toLowerCase())
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Invalid email address."),
  check("password")
    .customSanitizer((value: string) => value?.trim())
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
];

export const userLoginValidationRules: ValidationChain[] = [
  check("email")
    .customSanitizer((value: string) => value?.trim()?.toLowerCase())
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Invalid email address."),
  check("password")
    .customSanitizer((value: string) => value?.trim())
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
];
