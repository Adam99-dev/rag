import "dotenv/config";
import app from "./app.js";

app.listen(3000, () => {
  console.log(`Chat server running at http://localhost:${port}`);
});
