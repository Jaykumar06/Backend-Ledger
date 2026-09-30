const mongoose = require('mongoose');
const ledgerModel = require("./ledger.models")


const accountSchema= new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[ true,"Account must be created"],
        index: true

    },
    status:{
        type: String,
        enum:{
            values:['ACTIVE', "FROZEN","CLOSED"],
            message:"Status can be either ACTIVE, FROZEN, CLOSED",
           
        }, default:"ACTIVE"
    },
    currency:{
        type: String,
        required:[ true," CUrrency is required"],
        default:"INR"
    }
}, 
{
    timestamps: true
})


accountSchema.index({ user: 1 , status: 1})

accountSchema.methods.getBalance = async function(){
    const balanceData = await ledgerModel.aggregate([
        {
            $match: {
                account: this._id} },
            {
                $group: {
                    _id: null,
                    totaldebit:{
                        $sum:{
                            $cond:[
                                { $eq: ["$type", "DEBIT"]},
                                "$amount",
                                0
                            ]
                        }
                    },
                    totalcredit:{
                        $sum:{
                            $cond:[
                                { $eq: ["$type", "CREDIT"]},
                                "$amount",
                                0
                            ]
                        }
                    }
                }
            },
        {
            $project: { 
                _id: 0,
                balance: { $subtract: ["$totalcredit", "$totaldebit"] }
            }
        }
 ])
    if(balanceData.length === 0){
        return 0
    }
    return balanceData[0].balance
}
const accountModel = mongoose.model("accounts", accountSchema)

module.exports= accountModel
