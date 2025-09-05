const Note = require('../models/Note');
const Session = require('../models/Session');
const User = require('../models/User');


const getCurrentUser = async (req) => {
    const token = req.headers['token'];
    if (!token) return null;
    const session = await Session.findOne({ token });
    if (!session) return null;
    const user = await User.findOne({ username: session.username });
    return user;
};


const getNotes = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const notes = await Note.find({ username: user.username });
        res.json(notes);
    } catch (error) {
        console.error("Get Notes Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const getNoteById = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const note = await Note.findOne({ _id: req.params.id, username: user.username });
        if (!note) return res.status(404).json({ message: "Note not found" });

        res.json(note);
    } catch (error) {
        console.error("Get Note By ID Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const createNote = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const { title, content, category } = req.body;
        if (!title || !content) return res.status(400).json({ message: "Title and content are required" });

        const newNote = new Note({
            username: user.username,
            title,
            content,
            category
        });

        await newNote.save();
        res.status(201).json({ message: "Note created successfully", note: newNote });
    } catch (error) {
        console.error("Create Note Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const updateNote = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const { title, content, category } = req.body;
        const updatedNote = await Note.findOneAndUpdate(
            { _id: req.params.id, username: user.username },
            { title, content, category },
            { new: true }
        );

        if (!updatedNote) return res.status(404).json({ message: "Note not found" });
        res.json({ message: "Note updated successfully", note: updatedNote });
    } catch (error) {
        console.error("Update Note Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const partialUpdateNote = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const updatedNote = await Note.findOneAndUpdate(
            { _id: req.params.id, username: user.username },
            { $set: req.body },
            { new: true }
        );

        if (!updatedNote) return res.status(404).json({ message: "Note not found" });
        res.json({ message: "Note updated successfully", note: updatedNote });
    } catch (error) {
        console.error("Partial Update Note Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const deleteNote = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(200).json({ message: "Not Authenticated" });

        const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, username: user.username });
        if (!deletedNote) return res.status(404).json({ message: "Note not found" });

        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Delete Note Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    partialUpdateNote,
    deleteNote
};
