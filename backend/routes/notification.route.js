import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAllNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.route("/all").get(isAuthenticated, getAllNotifications);
router.route("/read/:id").post(isAuthenticated, markNotificationAsRead);
router.route("/read-all").post(isAuthenticated, markAllNotificationsAsRead);

export default router;
