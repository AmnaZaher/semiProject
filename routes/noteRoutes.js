const express = require('express');
const Note = require('../models/Note');
const {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    partialUpdateNote,
    deleteNote
} = require('../controllers/noteController');

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const notes = await Note.find({ username: req.user.username });
        res.render('notes', { title: "Notes", notes });
    } catch (error) {
        console.error("Render Notes Error:", error);
        res.render('notes', { title: "Notes", notes: [] });
    }
});


router.get('/api', getNotes);
router.get('/api/:id', getNoteById);
router.post('/api', createNote);
router.put('/api/:id', updateNote);
router.patch('/api/:id', partialUpdateNote);
router.delete('/api/:id', deleteNote);

module.exports = router;
