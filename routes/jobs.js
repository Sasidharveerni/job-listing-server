const express = require('express')
const Job = require('../models/jobs');
const user = require('../models/user');
const validateNewJob = require('../middlewares/validateNewJob');
const verifyToken = require('../middlewares/verifyToken');
const {ensureCandidate, ensureRecruiter} = require('../middlewares/validateNewUser')



const router = express.Router();



const getJobsWithTimestamps = async (req, res, next) => {
    try {
      const jobs = await Job.aggregate([
        {
          $addFields: {
            createdAt: { $toDate: '$_id' }
          }
        }
      ]);
      req.jobsWithTimestamps = jobs;
      next();
    } catch (error) {
      res.status(500).json({
        status: 'Failed',
        error: 'There is an error: ' + error
      });
    }
  };

router.get('/job/filter', getFilteredJobs())



router.get('/job/:jobId', async (req, res) => {
    try {
       const jobID = req.params.jobId;
       const job = await Job.findById(jobID);
       res.status(200).json({
        status: 'Success',
        message: 'Job found',
        data: job
       })
    } catch (error) {
        res.status(500).json({
            status: 'Failed',
            error: 'There is an error: ' + error
           })
    }
})

router.post('/apply/:jobId', verifyToken, ensureCandidate, async (req, res) => {
    try {
        const {jobId} = req.params;
        // console.log(jobId)
        const job = await Job.findById(jobId);
        // console.log(job)
        if (!job) {
            return res.status(404).json({status: 'Failed', message: 'Job not found' });
        }
        // console.log(req.user)
        req.user.appliedJobs.push(job._id);
        await req.user.save();
        res.status(200).json({status: 'Success', message: 'Applied to job successfully', job });
    } catch (error) {
        res.status(500).json({status: 'Failed', message: 'Error applying to job', error: error });
    }
});

router.get('/jobs', getJobsWithTimestamps, async (req, res) => {
    try {
        const jobData = req.jobsWithTimestamps;
        res.status(200).json({
            status: 'Success',
            data: jobData
        })
    } catch (error) {
        res.status(500).json({
            status: 'Failed',
            error: 'There is an error: ' + error
           })
    }
})

router.post('/add',verifyToken, validateNewJob, ensureRecruiter, async (req, res, next) => {
    try {
        const {companyName, logoUrl, jobPosition, monthlySalary, jobType, remote, location, jobDescription, aboutCompany, skillsRequired, additionalInformation} = req.body;
        const newJob = new Job({
            companyName, logoUrl, jobPosition, monthlySalary, jobType, remote, location, jobDescription, aboutCompany, skillsRequired, additionalInformation
        })
        await newJob.save();
        res.status(201).json({
            status: 'Success',
            message: 'Job added successfully',
            jobId: newJob._id
        })
    } catch (error) {
        res.status(500).json({
            status: 'Failed',
            error: 'There is an error: ' + error
           })
    }
})


router.patch('/update/:id',verifyToken, ensureRecruiter, async (req, res) => {
    try {
        const jobid = req.params.id;

        // Validate job ID
        if (!jobid) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Job ID is required',
            });
        }

        // Update the job with the fields provided in req.body
        const updatedJob = await Job.findByIdAndUpdate(
            jobid,
            { $set: req.body },
            { new: true, runValidators: true } // This returns the updated document and runs validators on update
        );

        if (!updatedJob) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Job not found',
            });
        }

        res.status(200).json({
            status: 'Success',
            message: 'Job updated successfully!',
            data: updatedJob,
        });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({
            status: 'Failed',
            message: 'There is an error: ' + error.message,
        });
    }
});


router.delete('/job/delete/:id',verifyToken, ensureRecruiter, async (req, res) => {
    try {
        const {id} = req.params;
        await Job.findByIdAndDelete(id);
        res.status(200).json({
            status: 'Success',
            message: 'Job deleted successfully!'
        })
    } catch (error) {
        res.status(500).json({
            status: 'Failed',
            error: 'There is an error: ' + error
           })
    }
})





module.exports = router


function getFilteredJobs() {
    return async (req, res) => {

        try {
            const { minSalary, maxSalary, jobType, jobPosition, location, remote, skills } = req.query;
            const skillsArray = skills ? skills.split(',') : [];
            const jobs = await Job.find(
                {
                    monthlySalary: {
                        $gte: minSalary || 0,
                        $lte: maxSalary || 999999999
                    },
                    jobPosition: jobPosition || { $exists: true },
                    jobType: jobType || { $exists: true },
                    location: location || { $exists: true },
                    remote: remote == 'true' || { $exists: true },
                }
            );

            const finalJobs = jobs.filter(job => {
                let isSkillMatched = true;
                if (skillsArray.length > 0) {
                    isSkillMatched = skillsArray.every(skill => job.skillsRequired.includes(skill));
                }
                return isSkillMatched;
            });

            //Handle this in the mongoose query itself
            res.status(200).json({
                message: 'Job route is working fine',
                status: 'Working',
                jobs: finalJobs
            });
        } catch (error) {
            next("Error Finding Jobs", error);
        }
    };
}