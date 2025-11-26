import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.resolve('uploads', 'images');
await fs.mkdir(uploadDir, { recursive: true });

export const saveFile = async (file) => {
    if (!file) {
        throw { statusCode: 400, message: 'File is required' };
    }
    // Multer in memoryStorage provides `originalname` and `buffer`.
    // If fields are missing, surface a clear error.
    if (!file.originalname || !file.buffer) {
        throw { statusCode: 400, message: 'Invalid file upload (missing originalname or buffer)' };
    }

    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, file.buffer);
    return `/uploads/images/${filename}`;
};