import express from "express";
import { Post } from "../models/post.model.js";
import { getFootstepsPosts } from "../controllers/post.controller.js";

const router = express.Router();

// GET all posts with valid location coordinates
router.get("/", getFootstepsPosts);

export default router;
