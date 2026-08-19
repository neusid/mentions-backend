import express from "express";
import dotenv from "dotenv";
import { testConnection } from "./db/client";
import ingestRouter from "./routes/ingest";
import mentionsRouter from "./routes/mentions";
import statsRouter from "./routes/stats";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use(ingestRouter);
app.use(statsRouter);
app.use(mentionsRouter);

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await testConnection();
});
