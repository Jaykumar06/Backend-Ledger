const express = require("express")
const authMiddleware = require("../middlewares/auth.middlewares")
const accountController = require("../controllers/accounts.controller")


const router = express.Router()

/**
 * - POST/api/accounts - Create a new account for the authenticated user.
 */

router.post("/", authMiddleware, accountController.createAccount)

module.exports = router