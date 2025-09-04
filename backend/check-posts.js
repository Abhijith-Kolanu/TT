import mongoose from "mongoose";
import { Post } from "./models/post.model.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

const checkPosts = async () => {
    try {
        console.log('Checking posts in database...');
        
        // Get a few posts to see their structure
        const posts = await Post.find().limit(3);
        
        console.log(`Found ${posts.length} posts`);
        
        posts.forEach((post, index) => {
            console.log(`\nPost ${index + 1}:`);
            console.log('- ID:', post._id);
            console.log('- createdAt:', post.createdAt);
            console.log('- updatedAt:', post.updatedAt);
            console.log('- Caption:', post.caption?.substring(0, 50) + '...' || 'No caption');
        });
        
    } catch (error) {
        console.error('Error checking posts:', error);
    }
}

const runCheck = async () => {
    await connectDB();
    await checkPosts();
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
    process.exit(0);
}

runCheck();
