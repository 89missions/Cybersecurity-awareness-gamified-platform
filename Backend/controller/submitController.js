const registeredUsers = require('../modal/regsiteredusers');
const Questions = require('../modal/questions'); // Added for total question count

const handleSubmission = async (req, res) => {
    try {
        const { points, answers, moduleId } = req.body

        // Validate points
        if (points > 500 || points < 0 || points % 50 !== 0) {
            return res.status(400).json({ "message": "bad request.." })
        }

        // Find the user
        const foundUser = await registeredUsers.findOne({ username: req.user })

        if (!foundUser) {
            return res.status(404).json({ "message": "cant find user in the database..." })
        }

        // Update points
        foundUser.totalPoints += points
        
        // Add answered questions
        if (answers && Array.isArray(answers)) {
            answers.forEach(ans => {
                foundUser.answeredQuestions.push({
                    questionId: ans.questionId,
                    moduleId: moduleId,
                    wasCorrect: ans.wasCorrect,
                    answeredAt: new Date()
                })
            })
        }

        // Get total questions available for this module
        const totalQuestionsInModule = await Questions.countDocuments({ 
            moduleId: moduleId 
        });

        // Count how many questions they've answered for this module
        const questionsForThisModule = foundUser.answeredQuestions.filter(
            q => q.moduleId === moduleId
        ).length;

        // Only mark as completed if they've answered ALL questions
        if (questionsForThisModule >= totalQuestionsInModule && 
            !foundUser.completedModulesList.includes(moduleId)) {
            
            foundUser.completedModulesList.push(moduleId);
            console.log(`Module ${moduleId} completed! All ${totalQuestionsInModule} questions answered.`);
        }

        // Get current completed modules count
        const completedCount = foundUser.completedModulesList.length

        // Calculate achievements (with duplicate checks)
        if (completedCount >= 1 && !foundUser.badges.includes("🔥 First Blood")) {
            foundUser.badges.push("🔥 First Blood")
        }
        
        if (completedCount >= 2 && !foundUser.badges.includes(" Persistence")) {
            foundUser.badges.push(" Persistence")
        }
        
        if (completedCount >= 3 && !foundUser.badges.includes("📚 Scholar")) {
            foundUser.badges.push("📚 Scholar")
        }
        
        if (foundUser.totalPoints >= 10000 && !foundUser.badges.includes("💰 Point Collector")) {
            foundUser.badges.push("💰 Point Collector")
        }
        
        if (foundUser.totalPoints >= 50000 && !foundUser.badges.includes("💎 Elite Agent")) {
            foundUser.badges.push("💎 Elite Agent")
        }
        
        if (foundUser.completedModulesList.includes("Phishing101") && !foundUser.badges.includes("🎣 Phishing Expert")) {
            foundUser.badges.push("🎣 Phishing Expert")
        }
        if (foundUser.completedModulesList.includes("VirusAttack101") && !foundUser.badges.includes("🦠 Malware Hunter")) {
            foundUser.badges.push("🦠 Malware Hunter")
        }
        if (foundUser.completedModulesList.includes("Prevention101") && !foundUser.badges.includes("🛡️ Security Guru")) {
            foundUser.badges.push("🛡️ Security Guru")
        }

        // Save the user
        await foundUser.save()

        return res.status(200).json({ 
            "message": "updated successfully...",
            "completedModules": completedCount,
            "totalPoints": foundUser.totalPoints,
            "badges": foundUser.badges
        })

    } catch (error) {
        console.error("Submission error:", error)
        return res.status(500).json({ "message": "internal server error" })
    }
}

module.exports = handleSubmission