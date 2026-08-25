import "dotenv/config";
import app from "./app.js";

const port = process.env.CHAT_PORT || 3003;

app.listen(port, () => {
  console.log(`Chat server running at http://localhost:${port}`);
});
