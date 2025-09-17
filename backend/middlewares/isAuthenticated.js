import jwt from "jsonwebtoken";
const isAuthenticated = async (req,res,next)=>{
    try {
        console.log('Authentication check - Cookies:', req.cookies);
        const token = req.cookies.token;
        if(!token){
            console.log('No token found in cookies');
            return res.status(401).json({
                message:'User not authenticated',
                success:false
            });
        }
        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if(!decode){
            console.log('Token verification failed');
            return res.status(401).json({
                message:'Invalid',
                success:false
            });
        }
        console.log('User authenticated with ID:', decode.userId);
    req.user = { _id: decode.userId };
        next();
    } catch (error) {
        console.log('Authentication error:', error.message);
        return res.status(401).json({
            message:'Authentication failed',
            success:false
        });
    }
}
export default isAuthenticated;