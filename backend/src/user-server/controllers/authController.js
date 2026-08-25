import { signup } from "../services/signupService.js";
import { login } from "../services/loginService.js";
import { logout } from "../services/logoutService.js";
import { getCurrentUser } from "../services/meService.js";


export async function signupController(req, res) {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        const result = await signup(name, email, password, res);
        
        return res.status(result.status).json({
            success: true,
            message: "User created successfully",
            data: result.data
        });
    } catch (error) {
        console.error("Signup error:", error);
        
        if (error.message === "User already exists") {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}


export async function loginController(req, res) {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const result = await login(email, password, res);
        
        return res.status(result.status).json({
            success: true,
            message: "Login successful",
            data: result.data
        });
    } catch (error) {
        console.error("Login error:", error);
        
        if (error.message === "Invalid credentials") {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}


export async function logoutController(req, res) {
    try {
        const result = await logout(res);
        
        return res.status(result.status).json({
            success: true,
            message: result.data.message
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}


export async function meController(req, res) {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login."
            });
        }
        const result = await getCurrentUser(userId);
        
        return res.status(result.status).json({
            success: true,
            message: "User fetched successfully",
            data: result.data
        });
    } catch (error) {
        console.error("Get user error:", error);
        
        if (error.message === "User not found") {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}
