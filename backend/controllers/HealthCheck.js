const ApiResponse = require('../utils/ApiResponse')
const AsyncHandler= require('../utils/AsyncHandler')


const HealthCheck = AsyncHandler( async (req,res) =>{
    return res.status(200).json(new ApiResponse(200,"OK","HealthCheckPassed"));
})

module.exports = HealthCheck;