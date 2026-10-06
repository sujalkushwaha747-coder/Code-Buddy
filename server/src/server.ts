import app from "./app";
import { env } from "./config/env";

const PORT = env.PORT;
const HOST = process.env.HOST;
const listenTarget = HOST ? `http://${HOST}:${PORT}` : `port ${PORT}`;

if (HOST) {
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on ${listenTarget}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on ${listenTarget}`);
  });
}
