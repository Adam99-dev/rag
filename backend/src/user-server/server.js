
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

app.listen(3004, () => {
  console.log(`User server running at http://localhost:3004`);
});
