const AsyncHandler = (requestHander) =>{
    return (req,res,next) =>{
        Promise.resolve(requestHander(req,res,next))
        .catch(err=>next(err))
    }
}

module.exports = AsyncHandler;