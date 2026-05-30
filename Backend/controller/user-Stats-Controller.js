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
        
        if (points < 1000) {
            findUser.rank = "RECRUIT"
        } else if (points < 1500) {
            findUser.rank = "BugHunterJr"
            findUser.badges.push("🐞")
        } else if (points < 2500) {
            findUser.rank = "ZeroDayZebra"
            findUser.badges.push(" ⚡")
        } else if (points < 3500) {
            findUser.rank = "PhishSniper"
            findUser.badges.push(" 🎯 ")
        } else if (points < 4500) {
            findUser.rank = "RootRanger"
            findUser.badges.push("🔑 ")
        } else if (points < 5500) {
            findUser.rank = "ExploitEagle"
            findUser.badges.push("🦅 ")
        } else if (points < 6500) {
            findUser.rank = "DarkEntropy"
            findUser.badges.push("🌌 ")
        } else if (points < 7500) {
            findUser.rank = "ShadowInjector"
            findUser.badges.push("👤 ")
        } else {
            findUser.rank = "HexViper"
            findUser.badges.push("🐍")
        }

        // Save the updated rank to database
        await findUser.save()

        const stats = {
            username: findUser.username,
            points: findUser.totalPoints,
            rank: findUser.rank,
            completedModules: findUser.completedModulesList.length,
            totalModules: findUser.totalModules,
            badges: findUser.badges
        }
        
      /*console.log(stats)*/
        return res.status(200).json(stats)
        
    } catch (error) {
        console.error("Error fetching user stats:", error)
        return res.status(400).json({ "message": "error fetching data" })
    }
}

module.exports = getUserStats