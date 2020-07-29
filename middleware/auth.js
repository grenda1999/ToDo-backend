const jwt = require("jsonwebtoken")
const config = require("config")
const infoColors = require("../config/chalk/variables")
const User = require("../models/User")

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header("Authorization").replace("Bearer ", "")

    // Check if not token
    if (!token) {
        return res.status(401).json({
            errors: [{
                msg: "No token, authorization denied"
            }]
        })
    }

    // Verify token
    try {
        jwt.verify(token, config.get("jwtSecret"), async (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    errors: [{
                        msg: "Token is not valid"
                    }]
                })
            } else {
                const user = await User.findOne({
                    _id: decoded.user.id,
                    "tokens.token": token
                })
                if (!user) {
                    return res.status(400).send()
                }

                req.user = user
                req.token = token

                next()
            }
        })
    } catch (e) {
        console.error(infoColors.error("Something wrong with auth middleware"))
        res.status(500).send("Server error")
    }
}