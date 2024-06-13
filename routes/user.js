const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const {validateNewUser} = require('../middlewares/validateNewUser');


const router = express.Router();

router.get('/data', async (req, res) => {
    try {
        const userData = await user.find();
        if (userData) {
            return res.status(200).json({
                status: 'Success',
                data: userData
            })
        } else {
            return res.status(200).json({
                status: 'Success',
                message: 'There ar no users as of now',
                data: userData
            })
        }
    } catch (error) {
        res.status(500).json({
            status: 'Failed',
            error: 'There is an error: ' + error
        })
    }
})

router.post('/register', validateNewUser, async (req, res) => {
    try {
        const { name, email, password, isRecruiter } = req.body;
        const existingUser = await user.findOne({ email: email })
        if (existingUser) {
            return res.status(501).json({
                status: 'Failed',
                message: 'User already exists!'
            })
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 5);
            const newUser = new user({
                name,
                email,
                password: hashedPassword,
                isRecruiter
            })

            await newUser.save();   // handle the case where users with same email-id should not be able register again
            return res.status(201).json({
                status: 'Success',
                message: 'User registered successfully',
                user: newUser
            })
        }
    } catch (error) {
        res.status(501).json({
            message: 'Something went wrong',
            err: error
        })
    }
})


router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body
        const existingUser = await user.findOne({ email: email });
        if (existingUser) {
            const passwordmatch = await bcrypt.compare(password, existingUser.password);
            if (passwordmatch) {
                const token = jwt.sign({id: existingUser._id, email: existingUser.email}, 'secretkey', {expiresIn: '7h'})  // takes 3 arguments 1-payload, 2-It's a secret key to encrypt 3-it expiresIn - 30s
                return res.status(200).json({
                    status: 'Success',
                    message: 'User logged in successfully',
                    token: token,
                    user: existingUser
                })
            }
            else {
                return res.status(501).json({
                    status: 'Failed',
                    message: 'Incorrect credentials'
                })
            }
        } else {
            return res.status(501).json({
                status: 'Failed',
                message: 'User does not exist, please sign up'
            })
        }
    } catch (error) {
        res.status(501).json({
            message: 'Something went wrong',
            err: error
        })
    }
})



router.delete('/delete/:id', async(req, res) => {
    try {
        const {id} = req.params;
        await user.findByIdAndDelete(id)
        res.json({
            status: 'Success',
            message: 'User deleted successfully!'
        })
    } catch (error) {
        res.status(501).json({
            message: 'Something went wrong',
            err: error
        })
    }
})

module.exports = router