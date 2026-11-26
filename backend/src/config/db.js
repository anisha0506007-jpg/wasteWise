import mongoose, { connect } from "mongoose"
const connectDB=async()=>{
    try{
        const connection=await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected Successfull")
    }catch(error){
        console.log("NongoDB connection Failed")

    }
}

export default connectDB;