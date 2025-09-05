const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Session = require('../models/Session');

// ========== REGISTER ==========
const register = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ message: "Username, password and email are required" });
        }

        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName
        });

        await newUser.save();

        res.redirect('/auth/login');
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// ========== LOGIN ==========
const loginStart = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(400).json({ message: "Wrong password" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otpCode;
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 دقائق
        await user.save();

        // في التطبيق الحقيقي OTP يتبعت بالإيميل/SMS
        res.json({ message: "OTP sent successfully", otp: otpCode });
    } catch (error) {
        console.error("Login Start Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ========== LOGIN VERIFY ==========
const loginVerify = async (req, res) => {
    try {
        const { username, otpCode } = req.body;

        if (!username || !otpCode) {
            return res.status(400).json({ message: "Username and OTP are required" });
        }

        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user || !user.otp || !user.otpExpiry) {
            return res.status(401).json({ message: "No active OTP" });
        }

        if (user.otp !== otpCode || user.otpExpiry < new Date()) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        // عمل session token
        const token = uuidv4();
        const session = new Session({
            username: user.username,
            token,
            role: user.role || "user"
        });
        await session.save();

        // امسح الـ OTP بعد الاستخدام
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.json({
            message: "Login successful",
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            },
            session: {
                username: user.username,
                token,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login Verify Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ========== LOGOUT ==========
const logout = async (req, res) => {
    try {
        const token = req.headers['token'];
        if (!token) return res.status(200).json({ message: "Not Authenticated" });

        const deletedSession = await Session.findOneAndDelete({ token });
        if (!deletedSession) {
            return res.status(404).json({ message: "Can't logout" });
        }

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ========== FORGOT PASSWORD ==========
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: "User not found" });

        // token صالح 5 دقائق
        const resetToken = uuidv4();
        user.passwordResetToken = resetToken;
        user.passwordResetTokenExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

      
        res.json({ message: "Password reset token sent successfully", token: resetToken });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ========== RESET PASSWORD ==========
const resetPassword = async (req, res) => {
    try {
        const { passwordResetToken } = req.query;
        const { newPassword, confirmPassword } = req.body;

        if (!passwordResetToken) {
            return res.status(400).json({ message: "Password reset token required" });
        }
        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password required" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const user = await User.findOne({ passwordResetToken });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (user.passwordResetTokenExpiry < new Date()) {
            return res.status(400).json({ message: "Password reset token expired" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordResetToken = null;
        user.passwordResetTokenExpiry = null;
        await user.save();

        res.json({ ok: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    register,
    loginStart,
    loginVerify,
    logout,
    forgotPassword,
    resetPassword
};
