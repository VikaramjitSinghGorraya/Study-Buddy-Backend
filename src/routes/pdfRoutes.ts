import express from "express";
import multer from "multer";
import { handlePDFUpload } from "../controllers/pdfController";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 100 MB limit
  },
});

router.post("/upload", upload.single("file"), handlePDFUpload);

export default router;
