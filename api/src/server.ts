import { app } from "./app";
import { env } from "./lib/env";

app.listen(env.PORT, () => {
  console.log(`Magazine API listening on http://localhost:${env.PORT}`);
});
