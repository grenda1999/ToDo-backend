const express = require("express");
const router = express.Router();
const {
    check,
    validationResult
} = require("express-validator");
const infoColors = require("../../config/chalk/variables");
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth")

const User = require("../../models/User");


// @route          POST api/auth
// @desc           Authenticate user & get token
// @access         Public
router.post("/",
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        let user = null

        try {
            try {
                // Check credentials
                user = await User.findByCredentials(req.body)
            } catch (error) {
                return res.status(400).json(error.error)
            }

            const token = await user.generateAuthToken();

            res.send({
                user,
                token
            });
        } catch (error) {
            console.error(infoColors.error(error.message))
            res.status(500).send('Server error')
        }
    });

// @route          GET api/auth
// @desc           Get user by token
// @access         Private
router.get("/", auth, async (req, res) => {
    res.send(req.user)
})

// @route          POST api/auth/logout
// @desc           Logout user
// @access         Private
router.post("/logout", auth, async (req, res) => {
    req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token
    })

    try {
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send("Server error")
    }
})

// @route          POST api/auth/logout-all
// @desc           Logout all users
// @access         Private
router.post("/logout-all", auth, async (req, res) => {
    req.user.tokens = []

    try {
        await req.user.save()

        res.send()
    } catch (error) {
        console.error(infoColors.error(error.message))
        res.status(500).send("Server error")
    }
})

module.exports = router;