import express from "express";
import multer from "multer";
import { askQuestion } from "../controllers/askQuestion";

const router = express.Router();

router.post("/question", askQuestion);
export default router;
