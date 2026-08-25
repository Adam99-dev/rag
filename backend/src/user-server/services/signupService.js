import {prisma} from "../config/prisma.js";
import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";

export async function signup(name, email, password, res) {

    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword
        }
    });

    const token = generateToken(newUser.id, newUser.email);

    const isSecure = process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";
    res.cookie("token", token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
        ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return {
        status: 201,
        data: {
            user: userWithoutPassword,
            token
        }
    };
}
