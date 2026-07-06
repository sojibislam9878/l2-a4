import dotenv from "dotenv"
import Path from "path"
dotenv.config({path:Path.join(process.cwd(),".env")})

const envConfig ={
    port: process.env.PORT!,
    database_url: process.env.DATABASE_URL!,
    bcrypt_salt_rounds: process.env.CRYPT_SALT_ROUNDS!,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
    payment_publishable_key: process.env.PAYMENT_PUBLISHABLE_KEY!,
    payment_secret_key: process.env.PAYMENT_PUBLISHABLE_KEY!,
    app_url: process.env.JWT_REFRESH_EXPIRES_IN!,

}

export default envConfig