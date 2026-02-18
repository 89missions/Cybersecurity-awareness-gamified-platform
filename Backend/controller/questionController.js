const questions = require('../modal/questions')
const registeredUsers = require('../modal/regsiteredusers')

const getQuestions = async (req,res)=>{
    try{
        // FIXED: Use moduleId to match frontend
        const moduleId = req.params.moduleId;

        const allQuestions = await questions.find({moduleId:moduleId})

        if(!allQuestions || allQuestions.length === 0){
          return res.status(404).json({"message":"cannot get questions, try another time..."})
        }

        return res.status(200).json({allQuestions})
    } catch(error){
        return res.status(500).json({"message":"internal server error.."})
    }
}

const getNextQuestions = async (req,res)=>{
    try {
        const moduleId = req.params.moduleId;
        const username = req.user;
        
        // Check if user exists
        const user = await registeredUsers.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // FIXED: Handle case where answeredQuestions might be undefined
        const answeredIds = (user.answeredQuestions || [])
            .filter(q => q.moduleId === moduleId)
            .map(q => q.questionId);
        
        // Find 10 questions user hasn't answered
        const nextQuestions = await questions.find({
            moduleId: moduleId,
            id: { $nin: answeredIds }
        }).limit(10);
        
        res.json({ allQuestions: nextQuestions });
        
    } catch (error) {
        console.error("Error in getNextQuestions:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {getQuestions, getNextQuestions}