const mongoose = require("mongoose")


const taskSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    subtasks: [{
        description: {
            type: String,
            required: true,
            trim: true
        },
        completed: {
            type: Boolean,
            default: false
        },
    }],
    completed: {
        type: Boolean,
        default: false
    },
    deadline: {
        type: Date,
        default: Date.now
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "low"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
})

module.exports = Task = mongoose.model("Task", taskSchema)