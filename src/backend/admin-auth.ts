import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { prisma } from "@/backend/prisma";

const ADMIN_SESSION_COOKIE = "erishot_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

type AdminSession = {
  email: string;
  expiresAt: number;
};

export function getConfiguredAdminEmail() {
  return process.env.ADMIN_EMAIL ?? "admin@erishot.com";
}

function getConfiguredAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "erishot2026";
}

function normalizeEnvSecret(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "").replaceAll("\\$", "$");
}

function getConfiguredAdminPasswordHash() {
  return normalizeEnvSecret(process.env.ADMIN_PASSWORD_HASH);
}

function getSessionSecret() {
  return (
    normalizeEnvSecret(process.env.ADMIN_SESSION_SECRET) ??
    "erishot-local-dev-session-secret"
  );
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export async function isValidAdminLogin(email: string, password: string) {
  const configuredEmail = getConfiguredAdminEmail().trim().toLowerCase();
  const configuredPasswordHash = getConfiguredAdminPasswordHash();
  const normalizedEmail = email.trim().toLowerCase();

  if (!safeEqual(normalizedEmail, configuredEmail)) {
    return false;
  }

  if (configuredPasswordHash) {
    if (!/^\$2[aby]\$\d{2}\$/.test(configuredPasswordHash)) {
      console.error("ADMIN_PASSWORD_HASH is not a valid bcrypt hash.");
      return false;
    }

    const adminUser = await prisma.adminUser.upsert({
      where: { email: configuredEmail },
      update: { passwordHash: configuredPasswordHash },
      create: {
        email: configuredEmail,
        passwordHash: configuredPasswordHash
      }
    });

    return bcrypt.compare(password, adminUser.passwordHash);
  }

  return safeEqual(password, getConfiguredAdminPassword());
}

export function createAdminSessionToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      expiresAt: Date.now() + SESSION_SECONDS * 1000
    } satisfies AdminSession),
    "utf8"
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as AdminSession;

    if (!session.email || session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export function setAdminSessionCookie(response: NextResponse, email: string) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionToken(email),
    httpOnly: true,
    maxAge: SESSION_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}
