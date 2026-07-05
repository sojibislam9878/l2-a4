import app from "./app";
import envConfig from "./config/envConfiq";
import { prisma } from "./lib/prisma";

const main = async () => {
  try {
    
    await prisma.$connect();
    console.log("connected to the database successfully")
    app.listen(envConfig.port, () => {
      console.log(`Example app listening on port ${envConfig.port}`);
    });
  } catch (error) {
    console.log(error);
    await prisma.$disconnect()
    process.exit(1)
  }
};

main()