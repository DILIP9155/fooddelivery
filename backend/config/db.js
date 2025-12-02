import mongoose from "mongoose";

const ConnectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);

    if (!conn) {
      console.log("not connected");
    }
    console.log("Db Connected");
  } catch (error) {
    console.log({ message: `db connect ${error}` });
  }
};

export default ConnectDb;
