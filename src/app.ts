import express, { type Application, type Request, type Response } from "express";
import cors from "cors"
import envConfig from "./config/envConfiq";
import cookieParser from "cookie-parser";
import { userRoute } from "./modules/user/user.routes";
import { authRoute } from "./modules/auth/auth.routes";
const app: Application = express();


app.use(cors({origin:envConfig.app_url, credentials: true}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoute)
app.use("/api/users", userRoute)

export default app