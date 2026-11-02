const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('.'));
const PORT = 3000;

app.use(express.json());


// MongoDB Connection (Aapke local MongoDB se connect karega)
mongoose.connect('mongodb://localhost:27017/habitTracker').then(() => {
    console.log('Connected to MongoDB database successfully!');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Database Schema (Dynamic months/days ke liye)
const habitSchema = new mongoose.Schema({
    name: { type: String, required: true },
    totalDays: { type: Number, required: true }, // Kitne din/mahine ka track hai (jaise 30, 90, 365)
    days: { type: Array, required: true }        // Checkboxes ka status array
});

const Habit = mongoose.model('Habit', habitSchema);

// 1. Sabhi habits get karna
app.get('/habits', async (req, res) => {
    try {
        const habits = await Habit.find();
        res.json(habits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Nayi habit add karna (Dynamic duration ke sath)
app.post('/habits', async (req, res) => {
    try {
        const { name, totalDays } = req.body;
        const initialDays = new Array(totalDays).fill(false);
        const newHabit = new Habit({ name, totalDays, days: initialDays });
        await newHabit.save();
        res.json(newHabit);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Kisi specific din ka status update karna
app.put('/habits/:id', async (req, res) => {
    try {
        const { days } = req.body;
        const updatedHabit = await Habit.findByIdAndUpdate(
            req.params.id,
            { days },
            { new: true }
        );
        res.json(updatedHabit);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Habit delete karna
app.delete('/habits/:id', async (req, res) => {
    try {
        await Habit.findByIdAndDelete(req.params.id);
        res.json({ message: 'Habit deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Server Start
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});