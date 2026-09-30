const accountModel= require("../models/account.models");

async function createAccount(req, res) {
    try {
        const userId = req.user._id; // Extract userId from req.user set by authMiddleware
        const account = await accountModel.create({ user: userId });

        return res.status(201).json({ message: "Account created successfully", account });
    } catch (error) {
        return res.status(500).json({ message: "Failed to create account", error: error.message });
    }
}

module.exports = {
    createAccount
};