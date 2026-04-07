import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getMessage, sendMessage, deleteChat, getChatContacts } from "../controllers/message.controller.js";

const router = express.Router();

router.route('/contacts').get(isAuthenticated, getChatContacts);
router.route('/send/:id').post(isAuthenticated, sendMessage);
router.route('/all/:id').get(isAuthenticated, getMessage);
router.route('/delete/:id').post(isAuthenticated, deleteChat);
 
export default router;