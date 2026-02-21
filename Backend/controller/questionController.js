const Questions = require('../modal/questions');  // Capitalized model import
const registeredUsers = require('../modal/regsiteredusers');

const getQuestions = async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const username = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        
        // Find user
        const user = await registeredUsers.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Get already answered question IDs
        const answeredIds = (user.answeredQuestions || [])
            .filter(q => q.moduleId === moduleId)
            .map(q => q.questionId);
        
        // Get TOTAL count of unanswered questions (for frontend to know if more exist)
        const totalUnanswered = await Questions.countDocuments({  // Using Questions model
            moduleId: moduleId,
            id: { $nin: answeredIds }
        });
        
        // Get ONLY the 10 questions for this page
        const questionsList = await Questions.find({  // Using Questions model with different variable name
            moduleId: moduleId,
            id: { $nin: answeredIds }
        })
        .skip(skip)
        .limit(limit);
        
        if (!questionsList || questionsList.length === 0) {
            return res.status(404).json({ message: "No questions available" });
        }
        
        // Return both the questions AND total count
        return res.status(200).json({ 
            questions: questionsList,  // Sending questionsList as questions
            totalAvailable: totalUnanswered,
            currentPage: page
        });
        
    } catch (error) {
        console.error("Error in getQuestions:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getQuestions };