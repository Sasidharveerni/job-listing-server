const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const token = req.header('Authorization').split(' ')[1];
        if(!token) 
            return res.status(404).json({Status: 'Failed', message: 'Token not found or invalid'})
        const decoded = jwt.verify(token, 'secretkey');
        console.log(decoded);
        req.user = decoded;
        next();

    } catch (error) {
        res.status(404).json({
            Status: 'Failed', 
            message: 'Token not found or invalid',
            error: error
        })
    }
}

module.exports = verifyToken;