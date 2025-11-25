import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadPostImage } from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {

    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    cb(null, filename);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post('/post-image', authMiddleware, upload.single('image'), uploadPostImage);

export default router;
