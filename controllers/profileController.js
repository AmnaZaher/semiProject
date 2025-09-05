const bcrypt = require('bcrypt');
const User = require('../models/User');
const Session = require('../models/Session');


const getCurrentUser = async (req) => {
    const token = req.headers['token'];
    if (!token) return null;
    const session = await Session.findOne({ token });
    if (!session) return null;
    const user = await User.findOne({ username: session.username });
    return user;
};


const getProfile = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            address: user.address
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const changePassword = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(200).json({ message: "Missing required fields" });
        }

        const validPass = await bcrypt.compare(oldPassword, user.password);
        if (!validPass) return res.status(200).json({ message: "Old password is incorrect" });
        if (newPassword !== confirmPassword) {
            return res.status(200).json({ message: "Passwords do not match" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Updated successfully" });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const changeFirstLastName = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const { firstName, lastName } = req.body;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        await user.save();

        res.json({ message: "Updated successfully" });
    } catch (error) {
        console.error("Change Name Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const enableOtp = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const { enableOtp } = req.body;
        if (enableOtp === undefined) {
            return res.status(200).json({ message: "Enable OTP is required" });
        }

        user.enableOtp = enableOtp;
        await user.save();

        res.json({ message: "Updated successfully" });
    } catch (error) {
        console.error("Enable OTP Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getProfile,
    changePassword,
    changeFirstLastName,
    enableOtp
};
