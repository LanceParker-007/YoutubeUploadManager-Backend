import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI_PROD, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDb Connectd: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};
