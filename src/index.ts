import request from "superagent";
import { decrypt } from "./utils";

/** A global request agent, so that we keep track of cookies properly */
const agent = request.agent().set("User-Agent", "Vitality NZ Script/100.0.0");

/** Sign into AIA Vitality */
async function login() {
  try {
    // Get the auth info into a state we can use
    const usernameEncrypted = process.env.AIA_USERNAME;
    const passwordEncrypted = process.env.AIA_PASSWORD;
    if (!usernameEncrypted || !passwordEncrypted) {
      throw Error("MissingCredentialsError");
    }
    const username = decrypt(usernameEncrypted);
    const password = decrypt(passwordEncrypted);
    /** The value for the basic auth header */
    const authValue = `Basic ${Buffer.from(`${username}:${password}`).toString(
      "base64"
    )}`;

    // Make the login request
    const loginResult = await agent
      .post("https://api.aia.com.au/vitality-mobile/sec/userLogin/v1")
      .set({
        Authorization: authValue,
      })
      .catch((err: any) => err);

    if (loginResult.status !== 200) {
      console.log(
        "Login error (HTTP)",
        loginResult.status,
        loginResult.response?.body
      );
      throw Error(`HTTPError ${loginResult.status}`);
    }
    if (
      loginResult.body.response.status !== "SUCCESS" ||
      !loginResult.body.response.loginDetails.vagToken
    ) {
      console.log("Login error (body)", loginResult.status, loginResult.body);
      throw Error(`LoginError (body)`);
    }

    console.log(
      "login.success",
      loginResult.body.response.loginDetails.emailAddress
    );

    return loginResult.body.response.loginDetails;
  } catch (error) {
    console.error("login.error", error);
    throw error;
  }
}

(async () => {
  const { vslToken, vagToken, entityId, memberId, regionId } = await login();

  console.log({ vslToken, vagToken, entityId, memberId, regionId });
})();
