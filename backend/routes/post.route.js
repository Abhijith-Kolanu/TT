import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
// 1. ADD 'getExplorePosts' TO THIS IMPORT LIST
import {
    addComment,
    addNewPost,
    bookmarkPost,
    deletePost,
    dislikePost,
    getAllPost,
    getCommentsOfPost,
    getExplorePosts, // ADD THIS
    getUserPost,
    likePost,
    getFootstepsPosts,
    getPostById,
} from "../controllers/post.controller.js";

const router = express.Router();

router.route("/addpost").post(isAuthenticated, upload.single('image'), addNewPost);
router.route("/all").get(isAuthenticated, getAllPost);
router.route("/userpost/all").get(isAuthenticated, getUserPost);
router.route("/:id").get(isAuthenticated, getPostById);
router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/:id/like").get(isAuthenticated, likePost);
router.route("/:id/dislike").get(isAuthenticated, dislikePost);
router.route("/:id/comment").post(isAuthenticated, addComment);
router.route("/:id/comment/all").post(isAuthenticated, getCommentsOfPost);
router.route("/:id/bookmark").get(isAuthenticated, bookmarkPost);
router.route("/footsteps").get(isAuthenticated, getFootstepsPosts);

// 2. THIS LINE WILL NOW WORK CORRECTLY
router.route("/explore").get(isAuthenticated, getExplorePosts);

export default router;