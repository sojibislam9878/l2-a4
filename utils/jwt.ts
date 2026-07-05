import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken"

const createToken = (payload: JwtPayload, secret: string, option: SignOptions) =>{
    const token = jwt.sign(payload, secret, option)

    return token
}

export const jtwUtils ={
    createToken
}