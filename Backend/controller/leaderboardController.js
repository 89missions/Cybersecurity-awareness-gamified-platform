const registeredUsers = require('../modal/regsiteredusers')

const getLeaderBoard= async (req,res)=>{
    try {
        //get the users in ascending order...
    const users = await registeredUsers.find().select('username totalPoints rank badges').sort({totalPoints:-1}).limit(20)

    if(!users || users.length === 0){
        return res.status(200).json({users: []})
    }
    return res.status(200).json({users})
    } catch (error) {
        return res.status(500).json({"message":"internal server error"})
    }
}
module.exports = getLeaderBoard