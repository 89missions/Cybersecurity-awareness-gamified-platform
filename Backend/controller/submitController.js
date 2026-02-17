const registeredUsers = require('../modal/regsiteredusers')

const handleSubmission= async (req,res)=>{
    //get the submission like this.. {totalPoints} i will get the user id from the jwt..

    //gets the points..
    const {points} = req.body

    //check if points isnt more than 250 which is the max or less than 0 or not a modulo of 50.. 
    if(points>250 || points<0 || points % 50 !==0){
        return res.status(400).json({"message":"bad request.."})
    } 

    //update the users point..
    //find the user...
    const foundUser = await registeredUsers.findOne({username:req.user})
    
    if(!foundUser){
        return res.status(404).json({"message":"cant find user in the database..."})
    }

   // foundUser.updateOne({totalPoints:{$inc:points}})

   await registeredUsers.updateOne(
    { username: req.user },
    { $inc: { totalPoints: points } }  // Correct $inc syntax
)
    return res.status(200).json({"message":"updated successfully..."})

}
module.exports = handleSubmission