import "dotenv/config";
import app from "./app.js";

const port = process.env.UPLOAD_PORT || 3001;

app.listen(port, () => {
  console.log(`Upload server running at http://localhost:${port}`);
});
