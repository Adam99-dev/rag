export async function logout(res) {
    const isSecure = process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax",
        path: "/",
        ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    });

    return {
        status: 200,
        data: {
            message: "Logged out successfully"
        }
    };
}
