import express from "express";
import { handleIncomingMessage } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", handleIncomingMessage);

export default router;