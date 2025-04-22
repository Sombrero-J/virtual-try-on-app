// Creates AWS Rekognition Client with SSO Credentials

import { fromSSO } from "@aws-sdk/credential-providers";
import { RekognitionClient } from "@aws-sdk/client-rekognition";

const client = new RekognitionClient({
  credentials: fromSSO({ profile: "my-sso-profile" }),
});

export { client };
