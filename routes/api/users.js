const express = require("express");
const router = express.Router();
const {
    check,
    validationResult
} = require("express-validator");
const infoColors = require("../../config/chalk/variables");
const pwdValidatior = require("../../validators/passwordValidator");
const auth = require("../../middleware/auth")

const User = require("../../models/User");

// @route          POST api/users
// @desc           Create user
// @access         Public
router.post(
    "/",
    [
        check("name", "Name is required").not().isEmpty().custom(value => value.trim()),
        check("surname", "Surname is required").not().isEmpty().custom(value => value.trim()),
        check("email", "Please include a valid email").isEmail(),
        check(
            "password",
            "Your password should: include both lower and upper case characeters, include at least one number, be at least 7 characters long, not have spaces"
        ).custom(value => pwdValidatior.validate(value)),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        const {
            name,
            surname,
            email,
            password
        } = req.body;

        try {
            let user = await User.findOne({
                email,
            });
            if (user) {
                return res.status(400).json({
                    errors: [{
                        msg: "User already exists",
                    }],
                });
            }

            user = new User({
                name,
                surname,
                email,
                password,
            });
            // Middleware (hash password before saving)
            await user.save();

            // Generate JSON web token
            const token = await user.generateAuthToken();

            res.status(201).send({
                user,
                token,
            });
        } catch (error) {
            console.error(infoColors.error(error.message));
            res.status(500).send("Server error");
        }
    }
);

// @route          DELETE api/users/me
// @desc           Delete user
// @access         Private
router.delete("/me", auth, async (req, res) => {
    try {
        await req.user.remove();

        res.send(req.user)
    } catch (error) {
        console.error(infoColors.error(error.message))
        res.status(500).send("Server error")
    }
})

// In the future

// @route          PATCH api/users/me
// @desc           Update user
// @access         Private
router.patch("/me", auth, async (req, res) => {

})
module.exports = router;