const transactionModel= require("../models/transactio.models")
const ledgerModel= require("../models/ledger.models")
const accountModel= require("../models/account.models")
const emailService= require("../services/email.services")
const mongoose = require('mongoose')


/**
 * 1. validate request body
 */


async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount } = req.body;
    const idempotencyKey = req.body.idempotencyKey || req.body.idempotencykey;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "All fields (fromAccount, toAccount, amount, idempotencyKey) are required"
        });
    }

    if (amount <= 0) {
        return res.status(400).json({
            message: "Amount must be greater than zero"
        });
    }

    const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
    const toUserAccount = await accountModel.findOne({ _id: toAccount });

    if (!fromUserAccount || !toUserAccount) {
        return res.status(404).json({
            message: "One or both accounts not found"
        });
    }

    if (req.user && fromUserAccount.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: "Unauthorized: You can only transfer funds from your own account"
        });
    }

    /**
     * 2. validate idempotency key
     */
    const isTrancationExist = await transactionModel.findOne({
        idempotencyKey
    });

    if (isTrancationExist) {
        if (isTrancationExist.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction with the same idempotency key is still pending",
                transaction: isTrancationExist
            });
        }
        if (isTrancationExist.status === "FAILED") {
            return res.status(200).json({
                message: "Previous transaction with the same idempotency key failed. You can retry.",
                transaction: isTrancationExist
            });
        }
        if (isTrancationExist.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction with the same idempotency key already completed",
                transaction: isTrancationExist
            });
        }
        if (isTrancationExist.status === "REVERSED") {
            return res.status(200).json({
                message: "Previous transaction with the same idempotency key was reversed. You can retry.",
                transaction: isTrancationExist
            });
        }
        return res.status(200).json({
            message: "Transaction with the same idempotency key already exists",
            transaction: isTrancationExist
        });
    }

    /**
     * 3. check account status
     */
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both accounts must be active to perform a transaction"
        });
    }

    /**
     * 4. check sufficient balance
     */
    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        });
    }

    /**
     * 5. create transaction with PENDING status inside a session
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const [transaction] = await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session });

        await ledgerModel.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session });

        await ledgerModel.create([{
            account: fromAccount,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session });

        transaction.status = "COMPLETED";
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        /**
         * 6. send email notifications (asynchronously)
         */
        emailService.sendTransactionEmail(
            req.user?.email,
            req.user?.name,
            amount,
            toUserAccount._id,
            transaction._id
        ).catch(err => console.error("Email notification error:", err.message));

        return res.status(201).json({
            message: "Transaction completed successfully",
            transaction
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
            message: "Transaction failed",
            error: err.message
        });
    }
}

module.exports = {
    createTransaction
};   