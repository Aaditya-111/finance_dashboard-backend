const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { jwtSecret, jwtExpiresIn } = require('../../config/env');

const register = async ({name, email, password, role}) => {
    //checking if email already exists or not
    const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );
    if (existing.rows.length > 0) {
        throw new ApiError(409, 'An account with this email already exists');
    }

    //Hashing the Password
    const hashedPassword = await bcrypt.hash(password, 12);

    //Insert user
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, is_active, created_at`,
        [name, email, hashedPassword, role || 'viewer']
    );

    return result.rows[0];

};

const login = async ({ email, password }) => {

    //Find user
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    const user = result.rows[0];
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    //checking if account is active
    if (!user.is_active) {
        throw new ApiError(403, 'Youraccount has been deactivated, please contact support');
    }

    //verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    //Signing jwt token
    const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};
const getMe = async (userId) => {
    const result = await pool.query(
        'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
        [userId]
    );
    if (!result.rows[0]) {
        throw new ApiError(404, 'User not found');
    }

    return result.rows[0];
};

module.exports = { register, login, getMe };