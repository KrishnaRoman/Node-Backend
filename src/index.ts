import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from 'cors';
import router from "./routes/auth";

const app = express();
const port = process.env.PORT || 3000;

// Add a list of allowed origins.
// If you have more origins you would like to add, you can add them to the array below.
// const allowedOrigins = ['*'];

const options: cors.CorsOptions = {
  origin: '*'
};

app.use(cors(options));
// Parse JSON in request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/auth", router);


app.listen(port, () => {
  console.log(`Auth server running on port ${port}.`);
});