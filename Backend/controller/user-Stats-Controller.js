const regsiteredusers = require('../modal/regsiteredusers')
const modules = require('../modal/modules')

const getUserStats = async (req, res) => {
    try {
        // Find the username in the db
        const findUser = await regsiteredusers.findOne({ username: req.user })
        
        if (!findUser) {
            return res.status(400).json({ "message": "Cannot find user" })
        }

        // Calculate rank based on total points
        const points = findUser.totalPoints || 0
        
        if (points < 5000) {
            findUser.rank = "RECRUIT"
        } else if (points < 15000) {
            findUser.rank = "BugHunterJr"
        } else if (points < 25000) {
            findUser.rank = "ZeroDayZebra"
        } else if (points < 35000) {
            findUser.rank = "PhishSniper"
        } else if (points < 45000) {
            findUser.rank = "RootRanger"
        } else if (points < 55000) {
            findUser.rank = "ExploitEagle"
        } else if (points < 65000) {
            findUser.rank = "DarkEntropy"
        } else if (points < 75000) {
            findUser.rank = "ShadowInjector"
        } else {
            findUser.rank = "HexViper"
        }

        // Save the updated rank to database
        await findUser.save()

        const stats = {
            username: findUser.username,
            points: findUser.totalPoints,
            rank: findUser.rank,
            completedModules: findUser.completedModulesList.length,
            totalModules: findUser.totalModules,
            badges: findUser.badches
        }
        
        console.log(stats)
        return res.status(200).json(stats)
        
    } catch (error) {
        console.error("Error fetching user stats:", error)
        return res.status(400).json({ "message": "error fetching data" })
    }
}

module.exports = getUserStats