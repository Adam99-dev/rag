export async function logout(res) {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax"
    });

    return {
        status: 200,
        data: {
            message: "Logged out successfully"
        }
    };
}
