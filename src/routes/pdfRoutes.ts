import { Router } from "express";
import { handlePDFUpload } from "../controllers/pdfController";
import { askQuestion } from "../controllers/askQuestion";

const router = Router();

router.post("/upload", handlePDFUpload);

router.post("/ask", askQuestion);

export default router;
