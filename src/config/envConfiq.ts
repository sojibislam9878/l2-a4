import dotenv from "dotenv"
import Path from "path"
dotenv.config({path:Path.join(process.cwd(),".env")})

const envConfig ={
    port: process.env.PORT!,
    database_url: process.env.DATABASE_URL!,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS!,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
    stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY!,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
    stripe_webhook_key: process.env.STRIPE_WEBHOOK_SECRET!,
    app_url: process.env.APP_URL!,

}

export default envConfig