const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
    getProfile,
    changePassword,
    changeFirstLastName,
    enableOtp
} = require('../controllers/profileController');

const router = express.Router();


router.get('/', authMiddleware, (req, res) => {
    try {
        const user = req.user; 
        res.render('profile', { title: "Profile", user });
    } catch (error) {
        console.error("Render Profile Error:", error);
        res.render('profile', { title: "Profile", user: null });
    }
});


router.get('/api', authMiddleware, getProfile);
router.post('/api/change-password', authMiddleware, changePassword);
router.post('/api/change-first-last-name', authMiddleware, changeFirstLastName);
router.post('/api/enable-otp', authMiddleware, enableOtp);

module.exports = router;
