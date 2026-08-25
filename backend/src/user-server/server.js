// server.js
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.USER_SERVER_PORT || 3000;

app.listen(port, () => {
  console.log(`User server running at http://localhost:${port}`);
});
