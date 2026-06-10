import { SignJWT, jwtVerify } from "jose";

const secret = () => {
  const key = process.env.JWT_SECRET;
  if (!key) throw new Error("JWT_SECRET is not set in .env.local");
  return new TextEncoder().encode(key);
};

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret());
  return payload;
}
