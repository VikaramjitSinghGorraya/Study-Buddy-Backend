import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import pdfRouter from "./routes/pdfRoutes";

dotenv.config();

const app = express();

const port = process.env.PORT || 4000;
app.use(cors());

app.use(express.json());
app.use("/api", pdfRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
