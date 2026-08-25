
import "dotenv/config";
import app from "./app.js";

const PORT = process.env.USER_SERVER_PORT || process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`User server running at http://localhost:${PORT}`);
});
