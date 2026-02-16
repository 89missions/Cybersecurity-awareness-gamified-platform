const modules = require('../modal/modules')

const getallModules = async (req,res)=>{
    try{
        //get all modules
        const allmodules = await modules.find()
       return res.status(200).json({allmodules})
    }catch(error){
        return res.status(500).json({"message":"internal server error..."})
    }
}

const getspecificModule = async(req,res)=>{
try{
    //get the id from the req params
    const moduleId =  req.params.id

    //find module
    const moduleExist = await modules.findOne({id:moduleId})

    //if it doesnt exist..
    if(!moduleExist){
        return res.status(404).json({"message":"cant find module..."})
    }

    return res.status(200).json({moduleExist})
}catch(error){
    return res.status(500).json({"message":"internal server error..."})
}
    
}
module.exports = {getallModules,getspecificModule}