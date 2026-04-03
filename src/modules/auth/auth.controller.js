const asyncHandler = require('../../utils/asyncHandler');
const authServices = require('./auth.service');

const register = asyncHandler(async(req, res) => {
    const user = await authServices.register(req.body);
    res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: user
    });
});

const login = asyncHandler(async(req, res) => {
    const { token, user } = await authServices.login(req.body);
    res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: { token, user }
    });
});

const getMe = asyncHandler(async(req, res) => {
    const user = await authServices.getMe(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
});

module.exports = { register, login, getMe };