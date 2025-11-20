import multer from 'multer';
import path from 'path';

// Lưu file vào memory
const uploadMiddeware = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext) && allowed.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File không đúng định dạng'));
        }
    }
});

export default uploadMiddeware;