import express from 'express';
import { LoanController } from '../controllers/loanController.js';

const router = express.Router();

// Route khusus diletakkan di atas rute umum
router.get('/top-borrowers', LoanController.getTopBorrowers);
router.get('/', LoanController.getLoans);
router.post('/', LoanController.createLoan);

export default router;
