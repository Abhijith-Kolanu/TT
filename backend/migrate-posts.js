import mongoose from "mongoose";
import { Post } from "./models/post.model.js";

// Use the same URI as the main app
const MONGO_URI = "mongodb+srv://sowmya7648:trektales@cluster0.onm0frl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

const migratePosts = async () => {
    try {
        console.log('Starting post migration...');
        
        // Find all posts without createdAt field
        const postsWithoutTimestamps = await Post.find({
            $or: [
                { createdAt: { $exists: false } },
                { updatedAt: { $exists: false } }
            ]
        });
        
        console.log(`Found ${postsWithoutTimestamps.length} posts without timestamps`);
        
        if (postsWithoutTimestamps.length === 0) {
            console.log('No posts need migration');
            return;
        }
        
        // Update posts with current date as createdAt and updatedAt
        const currentDate = new Date();
        
        for (let i = 0; i < postsWithoutTimestamps.length; i++) {
            const post = postsWithoutTimestamps[i];
            
            // Add some variation to make posts seem created at different times
            const hoursBack = Math.floor(Math.random() * 168); // Random hours in the last week
            const createdDate = new Date(currentDate.getTime() - (hoursBack * 60 * 60 * 1000));
            
            await Post.findByIdAndUpdate(post._id, {
                createdAt: createdDate,
                updatedAt: createdDate
            });
            
            console.log(`Updated post ${i + 1}/${postsWithoutTimestamps.length} - ID: ${post._id}`);
        }
        
        console.log('Migration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

const runMigration = async () => {
    await connectDB();
    await migratePosts();
    await mongoose.disconnect();
    console.log('Migration finished. Database connection closed.');
    process.exit(0);
}

runMigration();
