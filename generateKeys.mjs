#!/usr/bin/env node

import { generateKeyPair, exportSPKI, exportPKCS8 } from "jose";

const { publicKey, privateKey } = await generateKeyPair("RS256", { extractable: true });

const jwks = {
  keys: [
    {
      ...(await exportSPKI(publicKey)),
      kty: "RSA",
      use: "sig",
      alg: "RS256",
    },
  ],
};

const privateKeyPKCS8 = await exportPKCS8(privateKey);

console.log("JWT_PRIVATE_KEY:");
console.log(privateKeyPKCS8);
console.log("\nJWKS:");
console.log(JSON.stringify(jwks));

console.log("\nSet these environment variables:");
console.log(`npx convex env set JWT_PRIVATE_KEY '${privateKeyPKCS8}'`);
console.log(`npx convex env set JWKS '${JSON.stringify(jwks)}'`);