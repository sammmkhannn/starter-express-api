
export default function verifyAuth (req,res,next) {
    try{
        if(!req.header('auth-token')) {
            return res.status(401).send({success:false,Message:"Unauthorized Access"});
        } else {
            next();
        }
    }catch(err) {
        return res.status(500).send({success:false,Message:'Got an error while authentication'});
    }
}