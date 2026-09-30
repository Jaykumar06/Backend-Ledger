const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middlewares');
const transactionController = require('../controllers/transaction.controllers');    
const transactionRoutes = Router();

/**
 * - POST /api/transactions/
 * -create a new transaction
 */

transactionRoutes.post("/",authMiddleware, transactionController.createTransaction)



module.exports= transactionRoutes