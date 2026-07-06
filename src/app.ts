import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import envConfig from "./config/envConfiq";
import cookieParser from "cookie-parser";
import { userRoute } from "./modules/user/user.routes";
import { authRoute } from "./modules/auth/auth.routes";
import { serviceRoute } from "./modules/service/service.route";
import { technicianRoute } from "./modules/technician/technician.route";
import { categoryRoute } from "./modules/category/category.route";
import globalErrorHandler from "./middlewares/globalErrorHandler";
const app: Application = express();

app.use(cors({ origin: envConfig.app_url, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/services", serviceRoute);
app.use("/api/technicians", technicianRoute);
app.use("/api/categories", categoryRoute);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    message: "Route not found",
  });
});

app.use(globalErrorHandler);

export default app;
