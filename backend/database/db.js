import mongoose from 'mongoose'

const connectToDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Mongodb is connected successfully');
    } catch (error) {
        console.error("MongoDB connection failed", error);
        process.exit(1);
    }
}
export default connectToDB