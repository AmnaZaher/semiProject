const express = require('express');
const {
    register,
    loginStart,
    loginVerify,
    logout,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const router = express.Router();


router.get('/register', (req, res) => {
    res.render('register', { title: "Register" });
});

router.get('/login', (req, res) => {
    res.render('login', { title: "Login" });
});


router.post('/register', register);
router.post('/login/start', loginStart);
router.post('/login/verify', loginVerify);
router.delete('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
