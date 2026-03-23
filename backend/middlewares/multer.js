import multer from "multer";

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    
    const mimeType = file.mimetype.toLowerCase();

    if (allowedImageTypes.includes(mimeType) || allowedVideoTypes.includes(mimeType)) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed'));
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Custom error handler for multer
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({ message: 'File size too large. Maximum 50MB allowed.' });
        }
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

export default upload;
