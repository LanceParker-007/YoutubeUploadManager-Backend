import app from "./app.js";
import { connectDB } from "./config/db.js";

try {
  connectDB();

  app.listen(process.env.PORT, () => {
    console.log(`Server is up and running on port ${process.env.PORT}`);
  });
} catch (error) {
  console.log(error.message);
}
