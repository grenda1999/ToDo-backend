const express = require('express')
const router = express.Router()
const infoColors = require("../../config/chalk/variables")
const auth = require("../../middleware/auth")
const checkObjectId = require("../../middleware/checkObjectId")
const {
    check,
    validationResult
} = require("express-validator");

const Task = require("../../models/Task")

// @route          POST api/tasks
// @desc           Create task
// @access         Private
router.post('/', [auth, [
    check("category", "Category is required").not().isEmpty().custom(value => value.trim()).withMessage("Category needs to include at least 1 character"),
    check("title", "Title is required").not().isEmpty().custom(value => value.trim())
    .withMessage("Title needs to include at least 1 character"),
    check("description", "Description is required").not().isEmpty().custom(value => value.trim()).withMessage("Description needs to include at least 1 character"),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()

        res.status(201).send(task)
    } catch (error) {
        console.error(infoColors.error(error.message))
        res.status(500).send('Server error')
    }
})

// @route          GET api/tasks
// @desc           Get tasks
// @access         Private
router.get('/', auth, async (req, res) => {
    try {
        await req.user.populate("tasks").execPopulate()

        res.send(req.user.tasks)
    } catch (error) {
        console.error(infoColors.error(error.message))
        res.status(500).send('Server error')
    }
})

// @route          GET api/tasks/:task_id
// @desc           Get specific task
// @access         Private
router.get('/:task_id', [auth, checkObjectId("task_id")], async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.task_id,
            owner: req.user._id
        })
        if (!task) {
            return res.status(404).send('Task was not found')
        }

        res.send(task)
    } catch (error) {
        console.error(infoColors.error(error.message))
        res.status(500).send('Server error')
    }
})

// @route          PATCH api/tasks/:task_id
// @desc           Update task
// @access         Private
router.patch('/:task_id', [auth, checkObjectId("task_id"), [
    check("subtasks", "Invalid updates").not().exists(),
    check("category", "Category is required").optional().not().isEmpty().custom(value => value.trim()),
    check("title", "Title is required").optional().not().isEmpty().custom(value => value.trim()),
    check("description", "Description is required").optional().not().isEmpty().custom(value => value.trim())
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    const requestBody = req.body
    const updates = Object.keys(requestBody)
    const allowedUpdates = ["category", "title", "description", "completed", "deadline", "priority"]
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).json({
            errors: [{
                msg: "Invalid updates"
            }]
        })
    }

    try {
        const task = await Task.findOne({
            _id: req.params.task_id,
            owner: req.user._id
        })
        if (!task) {
            return res.status(404).send()
        }

        updates.forEach(update => {
            task[update] = requestBody[update]
        })

        await task.save()

        res.send(task)
    } catch (error) {
        console.error(infoColors.error(error.message))
        res.status(500).send('Server error')
    }
})

// @route          PUT api/tasks/subtasks/:task_id
// @desc           Add subtask
// @access         Private
router.put('/subtasks/:task_id', [auth, checkObjectId("task_id"), [
    check("description", "Description is required").not().isEmpty().custom(value => value.trim()).withMessage("Description needs to include at least 1 character")
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    const {
        description,
        completed
    } = req.body

    try {
        const task = await Task.findOne({
            _id: req.params.task_id,
            owner: req.user._id
        })
        if (!task) {
            return res.status(404).send()
        }

        const newSubtask = {
            description,
            completed
        }

        task.subtasks.unshift(newSubtask)

        await task.save()

        res.send(task)
    } catch (error) {
        console.error(infoColors.error(error.message))
        res.status(500).send('Server error')
    }
})


// @route          PATCH api/tasks/subtasks/:subtask_id
// @desc           Update subtask
// @access         Private
router.patch('/subtasks/:subtask_id', [auth, checkObjectId("subtask_id"), [
    check("description", "Category is required").optional().not().isEmpty().custom(value => value.trim()),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    const requestBody = req.body
    const updates = Object.keys(requestBody)
    const allowedUpdates = ["description", "completed"]
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).json({
            errors: [{
                msg: "Invalid updates"
            }]
        })
    }

    const {
        description,
        completed
    } = requestBody

    try {
        const task = await Task.findOneAndUpdate({
            "subtasks._id": req.params.subtask_id
        }, {
            $set: {
                "subtasks.$.description": description,
                "subtasks.$.completed": completed
            }
        }, {
            omitUndefined: true,
            new: true
        })
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (error) {
        console.error(infoColors.error(error.message))
        res.status(500).send('Server error')
    }
})

// In the future

// @route          DELETE api/tasks/:task_id
// @desc           Delete task
// @access         Private
router.delete("/:task_id", auth, async (req, res) => {

})

// @route          DELETE api/tasks/subtasks/:subtask_id
// @desc           Delete subtask
// @access         Private
router.delete("/subtasks/:subtask_id", auth, async (req, res) => {

})

module.exports = router