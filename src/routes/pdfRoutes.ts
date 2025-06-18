import express from "express";
import multer from "multer";
import { handlePDFUpload } from "../controllers/pdfController";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), handlePDFUpload);

export default router;
