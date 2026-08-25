import "dotenv/config";
import app from "./app.js";

const PORT = process.env.CHAT_SERVER_PORT || process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
