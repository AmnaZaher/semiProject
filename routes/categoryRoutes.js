const express = require('express');
const Category = require('../models/Category');
const {
    getCategories,
    createCategory,
    deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ username: req.user.username }); 
        res.render('categories', { title: "Categories", categories });
    } catch (error) {
        console.error("Render Categories Error:", error);
        res.render('categories', { title: "Categories", categories: [] });
    }
});


router.get('/api', getCategories);
router.post('/api', createCategory);
router.delete('/api/:id', deleteCategory);

module.exports = router;
