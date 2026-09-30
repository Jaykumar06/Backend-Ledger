const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controler")

 
/* Post /api/auth/register*/
router.post("/register",authController.userRegisterController)


/* Post /api/auth/login*/
router.post("/login",authController.userLoginController)
 
module.exports = router