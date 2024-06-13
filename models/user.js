const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isRecruiter: {
        type: Boolean,
        required: true,
        default: false
    },
    appliedJobs: {
        type: [mongoose.Schema.Types.ObjectId], // Array of job IDs
        ref: 'Job',
        default: [] // Only for candidates
    }
});

module.exports = mongoose.model('User', userSchema);
