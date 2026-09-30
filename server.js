require("dotenv").config()


const app = require("./src/app")
const DBconnect= require("./src/config/db")

DBconnect()

app.listen(3000,()=>{
    console.log("Server is running on port 3000")
})