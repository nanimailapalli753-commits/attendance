import serverless from "serverless-http";
import { app } from "../../server";

const expressHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  let requestPath = event.path || "/";

  // Remove Netlify Function prefix
  requestPath = requestPath.replace(/^\/\.netlify\/functions\/api/, "");

  // Add /api because the Express routes use /api/...
  if (!requestPath.startsWith("/api")) {
    requestPath = `/api${requestPath}`;
  }

  event.path = requestPath;

  if (event.rawPath) {
    event.rawPath = requestPath;
  }

  return expressHandler(event, context);
};