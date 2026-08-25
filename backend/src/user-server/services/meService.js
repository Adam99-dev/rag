// services/userService.js
import {prisma} from "../config/prisma.js";

export async function getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            plan: true
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return {
        status: 200,
        data: {
            user
        }
    };
}
