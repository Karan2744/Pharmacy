import express from "express";
import { exportproductsCSV } from "../Controllers/pincodeController";

const router = express.Router();

router.get("/export-csv", exportproductsCSV);

export default router;