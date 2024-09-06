const Note = require('../models/Note')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')



// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
    // Get all notes from MongoDB
    const notes = await Note.find().lean()

    // If no notes 
    if (!notes?.length) {
        return res.status(400).json({ message: 'No Notes found' })
    }

    res.json(notes)
})


// @desc Create all notes
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text} = req.body
     // Confirm data
     if (!user || !title || !text ) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    
    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

   

    // Create and store new Note 
    const note = await Note.create({ user, title, text})

    if (note) { //created 
        res.status(201).json({ message: `New Note  " ${title} " created` })
    } else {
        res.status(400).json({ message: 'Invalid Note data received' })
    }
})


// @desc update all notes
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    
    const { id, user, title, text, completed } = req.body

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm note exists to update
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()

    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)

})



// @desc Delete all notes
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID Required' })
    }

    // Does the "Note" exist to delete?
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note title : ' ${note.title} ' with ID ${note.id} deleted`

    res.json(reply)
})



// **** 
module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}