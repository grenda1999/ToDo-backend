const passwordValidator = require('password-validator')

const schema = new passwordValidator()

schema
    .has().not().spaces()
    .has().digits()
    .has().uppercase()
    .has().lowercase()
    .is().min(7)

module.exports = schema