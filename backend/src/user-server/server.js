
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.USER_PORT || 3002;
app.listen(port, () => {
  console.log(`User server running at http://localhost:${port}`);
});
