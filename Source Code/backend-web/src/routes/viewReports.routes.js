import express from 'express';
import viewReportsController from '../services/viewReport.services.js';


const router = express.Router();

// GET view reports
router.get('/', viewReportsController.viewReport);

export default router;