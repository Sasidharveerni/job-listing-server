const validateNewUser = (req, res, next) => {
    const {name, email, isRecruiter, password} = req.body;
    if(!name || !email || !password || !isRecruiter) {
        res.status(401).json({
            status: 'Failed',
            message: 'Please provide all the fields'
        })
    }
    const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!emailRegex.test(email)) {
        res.status(400).json({
            status: 'Failed',
            message: 'Please provide a valid email'
        })
    }
    next();
}

const ensureRecruiter = (req, res, next) => {
    if (req.user && req.user.isRecruiter) {
        next();
    } else {
        res.status(403).json({status: 'Failed', message: 'Access denied. Recruiters only.' });
    }
};

const ensureCandidate = (req, res, next) => {
    if (req.user && !req.user.isRecruiter) {
        next();
    } else {
        res.status(403).json({status: 'Failed', message: 'Access denied. Candidates only.' });
    }
};



module.exports = {validateNewUser, ensureCandidate, ensureRecruiter};