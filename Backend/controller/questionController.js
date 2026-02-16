const questions = require('../modal/questions')

const getQuestions = async (req,res)=>{
    try{
        //get the module id..
        const moduleId = req.params.id

        //search the question module for questions with id that comes with the requests..
        const allQuestions = await questions.find({moduleId:moduleId})

        //if questions do not exist..
        if(!allQuestions || allQuestions.length === 0){
          return res.status(404).json({"message":"cannot get questions, try another time..."})
        }

        return res.status(200).json({allQuestions})
         }catch(error){
            return res.status(500).json({"message":"internal server error.."})
        }
}
module.exports = getQuestions