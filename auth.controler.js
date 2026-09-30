const userModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.services");

/* user registration controller */

async function userRegisterController(req, res) {
        const { email, name, password } = req.body;

        const isExists = await userModel.findOne({
            email: email
        });

        if (isExists) {
            return res.status(400).json({       
                message: "email already exists",
                status: "fail"
            });
        }   

        const user = await userModel.create({
            email,
            name,
            password
        });

        const token = jwt.sign({
            userId: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: "3d"
        });

        res.cookie("token", token);

        await emailService.sendRegisterionEmail(user.email, user.name);
        
        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });
    }

/**
 *  - User Login Controller
 *  - post/api/auth/login
 */
async function userLoginController(req,res) {
    const {email,password}= req.body

    const user = await userModel.findOne({
        email,
    }).select("+password")
    if(!user){
        return res.status(401)
        .json({
            message: "Email or password is invalid"

        })
    }
     const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
        return res.status(401)
        .json({
            message: "Email or password is invalid"
        });
    }
    const token = jwt.sign({
            userId: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: "3d"
        });

        res.cookie("token", token);

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });
}


module.exports = {
    userRegisterController,
    userLoginController
};
