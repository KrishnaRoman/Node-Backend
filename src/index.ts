import * as express from "express";
import router from "./routes/auth";

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON in request bodies
app.use(express.json());

app.use("/auth", router);


app.listen(port, () => {
  console.log(`Auth server running on port ${port}.`);
});