export async function logout(res) {
    const isSecure = process.env.NODE_ENV !== "development" || process.env.COOKIE_SECURE === "true";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax",
        path: "/",
    });

    return {
        status: 200,
        data: {
            message: "Logged out successfully"
        }
    };
}
