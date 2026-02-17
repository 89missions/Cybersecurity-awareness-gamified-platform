const regsiteredusers = require('../modal/regsiteredusers')
const modules = require('../modal/modules')

const getUserStats = async (req,res)=>{
    try{
    //find the username in the db..
    const findUser = await regsiteredusers.findOne({username:req.user})
    //if not found, return error
    if(!findUser){
        return res.status(400).json({"message":"Cannot find user"})
    }
 
    const stats = {
        username:findUser.username,
        points:findUser.totalPoints,
        completedModules:findUser.completedModules,
        totalModules:findUser.totalModules,
        badges:findUser.badges}
        console.log(stats)
        return res.status(200).json(stats)
    }catch(error){
       return res.status(400).json({"message":"error fetching data"})
    }
}
module.exports = getUserStats