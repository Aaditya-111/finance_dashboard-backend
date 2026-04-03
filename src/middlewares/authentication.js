const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const ApiError = require('../utils/ApiError');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new ApiError(401, 'Not authenticated'));
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        
        req.user = decoded;
        next();
    } catch (error) {
        return next(new ApiError(401, 'Not authenticated'));
    }
};

module.exports = authenticate;