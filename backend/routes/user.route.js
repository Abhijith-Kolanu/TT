import express from "express";
// 1. ADD 'searchUsers' TO THIS IMPORT LIST
import { 
    editProfile, 
    followOrUnfollow, 
    getProfile, 
    getSuggestedUsers, 
    login, 
    logout, 
    register, 
    searchUsers 
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/profile/edit').post(isAuthenticated, upload.single('profilePhoto'), editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUsers);
router.route('/followorunfollow/:id').post(isAuthenticated, followOrUnfollow);
router.route('/:id/profile').get(isAuthenticated, getProfile);

// 2. THIS LINE WILL NOW WORK CORRECTLY
router.route("/search/:query").get(isAuthenticated, searchUsers);

export default router;