const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
     fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"accounts",
        required:[ true,"From Account is required"],
     },
        toAccount:{ 
        type: mongoose.Schema.Types.ObjectId,
        ref:"accounts",
        required:[ true,"To Account is required"],
        },
        status:{
            type: String,
            enum:{
                values:['PENDING', "COMPLETED","FAILED", "REVERSED"],
                message:"Status can be either PENDING, COMPLETED, FAILED or REVERSED",}
        },
        amount:{
            type: Number,
            required:[ true,"Amount is required"],
            min:[ 0.01, "Amount must be greater than zero"] 
        },
        idempotencyKey:{
            type: String,
            required:[ true,"Idempotency Key is required"], 
            unique: true
        },
        },
{
    timestamps: true
})

const TransactionModel = mongoose.model("transactions", TransactionSchema)

module.exports= TransactionModel

