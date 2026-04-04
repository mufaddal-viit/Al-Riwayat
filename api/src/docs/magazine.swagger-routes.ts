import express from "express";

import magazineAdminRoutes from "../modules/magazine/magazine.admin.routes";
import magazineReaderRoutes from "../modules/magazine/magazine.reader.routes";

const app = express();

app.use("/api/magazine", magazineReaderRoutes);
app.use("/api/admin/magazine", magazineAdminRoutes);

export default app;
