import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import pdfRouter from "./routes/pdfRoutes";

dotenv.config();

const app = express();

const port = process.env.PORT || 4000;
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", pdfRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
