import express from 'express';
import { generatePdf } from '../controllers/printController.js';
// import { authenticateToken } from '../middleware/authMiddleware.js'; // Optional: if you want to protect printing

const router = express.Router();

// POST /api/print/generate
// Protected by auth middleware in server.js mount point if needed, 
// or we can add it here.
router.post('/generate', generatePdf);

export default router;
