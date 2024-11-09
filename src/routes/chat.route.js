import { Router } from "express";
import { handleChat, handleSpeech } from "../controllers/chat.controller.js";

const chatRouter = Router();

chatRouter.post("/", handleChat);
chatRouter.post("/speech", handleSpeech);
export default chatRouter;
