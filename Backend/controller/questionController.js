const Questions = require('../modal/questions');
const registeredUsers = require('../modal/regsiteredusers');

const getQuestions = async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const username = req.user;
        
        // FORCE these to be numbers
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        console.log("\n========== PAGINATION DEBUG ==========");
        console.log("Page param:", req.query.page, "->", page);
        console.log("Limit param:", req.query.limit, "->", limit);
        console.log("Skip calculated:", skip);
        
        // Find user
        const user = await registeredUsers.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Get answered IDs
        const answeredIds = (user.answeredQuestions || [])
            .filter(q => q.moduleId === moduleId)
            .map(q => q.questionId);
        
        // Get TOTAL unanswered count
        const totalUnanswered = await Questions.countDocuments({
            moduleId: moduleId,
            id: { $nin: answeredIds }
        });
        
        // Get paginated questions - CRITICAL PART
        const questionsList = await Questions.find({
            moduleId: moduleId,
            id: { $nin: answeredIds }
        })
        .skip(skip)
        .limit(limit)
        .lean(); // Add .lean() for better performance
        
        console.log(`Returning ${questionsList.length} of ${totalUnanswered} total`);
        
        if (!questionsList || questionsList.length === 0) {
            return res.status(404).json({ message: "No questions available" });
        }
        
        return res.status(200).json({ 
            allQuestions: questionsList,
            totalAvailable: totalUnanswered,
            currentPage: page
        });
        
    } catch (error) {
        console.error("Error in getQuestions:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getQuestions };