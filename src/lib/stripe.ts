import Stripe from "stripe"
import envConfig from "../config/envConfiq"

export const stripe = new Stripe(envConfig.stripe_secret_key)