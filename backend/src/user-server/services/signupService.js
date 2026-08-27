import { prisma } from "../config/prisma.js";
import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";
import {stripeClient} from "../config/stripe.js";
import "dotenv/config";


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

    const stripeCustomer = await stripeClient.customers.create({
        name: name,
        email: email,
        metadata: {
            userId: newUser.id
        }
    });

    const updatedUser = await prisma.user.update({
        where: { id: newUser.id },
        data: { stripeCustomerId: stripeCustomer.id }
    });

    const token = generateToken(newUser.id, newUser.email);

    const isSecure = process.env.NODE_ENV !== "development" || process.env.COOKIE_SECURE === "true";
    res.cookie("token", token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return {
        status: 201,
        data: {
            user: userWithoutPassword,
            token,
            stripeCustomerId: stripeCustomer.id
        }
    };
}