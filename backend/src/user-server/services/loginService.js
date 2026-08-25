import { prisma } from "../config/prisma.js";
import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";

export async function login(email, password, res) {

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    const token = generateToken(user.id, user.email);

    const isSecure = process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";
    res.cookie("token", token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
        ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
        status: 200,
        data: {
            user: userWithoutPassword,
            token
        }
    };
}
