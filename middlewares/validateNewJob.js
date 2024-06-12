const validateNewJob = (req, res, next) => {
    // Destructure fields from request body
    const {
        companyName,
        logoUrl,
        jobPosition,
        monthlySalary,
        jobType,
        remote,
        location,
        jobDescription,
        aboutCompany,
        skillsRequired,
        additionalInformation
    } = req.body;

    // Check if required fields are provided
    if (!companyName || !logoUrl || !jobPosition || !monthlySalary || !jobType || !location || !jobDescription || !aboutCompany || !skillsRequired) {
        return res.status(400).json({
            status: 'Failed',
            message: 'Please provide all required fields',
        });
    }

    // Validate job type
    const validJobTypes = ["Full-Time", "Part-Time", "Internship"];
    if (!validJobTypes.includes(jobType)) {
        return res.status(400).json({
            status: 'Failed',
            message: 'Invalid job type. Must be Full-Time, Part-Time, or Internship',
        });
    }

    // Validate skillsRequired
    const validSkills = Array.isArray(skillsRequired) && skillsRequired.every(skill => typeof skill === 'string');
    if (!validSkills) {
        return res.status(400).json({
            status: 'Failed',
            message: 'Invalid skillsRequired. Must be an array of strings',
        });
    }

    // Validate monthlySalary
    const validMonthlySalary = typeof Number(monthlySalary) === 'number' && monthlySalary > 0;
    // console.log(typeof(Number(monthlySalary)))
    if (!validMonthlySalary) {
        return res.status(400).json({
            status: 'Failed',
            message: 'Invalid monthlySalary. Must be a number greater than 0',
        });
    }

    // Validate logoUrl
    const validLogoUrl = logoUrl.match(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i);
    if (!validLogoUrl) {
        return res.status(400).json({
            status: 'Failed',
            message: 'Invalid logoUrl. Must be a valid image URL ending with png, jpg, jpeg, gif, svg, or webp',
        });
    }

    // If all validations pass, proceed to the next middleware
    next();
};

module.exports = validateNewJob