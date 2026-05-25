import swaggerUi from "swagger-ui-express";

import magazineSwaggerDocument from "./magazine.swagger-output.json";

export const magazineSwaggerSpec = magazineSwaggerDocument;

export const magazineSwaggerUi = [
  swaggerUi.serve,
  swaggerUi.setup(magazineSwaggerDocument, {
    explorer: true,
    customSiteTitle: "Magazine API Docs",
    swaggerOptions: {
      displayRequestDuration: true,
      docExpansion: "list",
      filter: true,
    },
  }),
] as const;
