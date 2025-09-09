import { OAuth2Client } from "google-auth-library";
import config from "../config/index.js";

const client = new OAuth2Client(config.googleClientId);

export const verifyGoogleToken = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.googleClientId,
  });
  return ticket.getPayload();
};