const Category = require('../models/Category');
const Session = require('../models/Session');
const User = require('../models/User');

//بيانات المستخدم الحالي من خلال التوكن
const getCurrentUser = async (req) => {
    const token = req.headers['token'];
    if (!token) return null;
    const session = await Session.findOne({ token });
    if (!session) return null;
    const user = await User.findOne({ username: session.username });
    return user;
};



const getCategories = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const categories = await Category.find({ username: user.username });
        res.json(categories);
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const createCategory = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Category name is required" });

        const newCategory = new Category({
            username: user.username,
            name
        });
        await newCategory.save();

        res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
        console.error("Create Category Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const deleteCategory = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const { id } = req.params;
        const deletedCategory = await Category.findOneAndDelete({
            _id: id,
            username: user.username
        });

        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Delete Category Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getCategories,
    createCategory,
    deleteCategory
};
