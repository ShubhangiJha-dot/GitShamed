require("dotenv").config();
// require =Node.js's module-loading mechanism.loads code from another 
// module/package and Store that exported value in variable called express.
//import dependecy:
const express = require("express");
const cors = require("cors");

// Express application object, created by express with methods and properties that let you configure and run your web application.
// For example:app.get();app.post();app.use();app.listen();
//create application:
const app = express();
const PORT = process.env.PORT || 5000;

const githubRoutes = require("./routes/githubRoutes");
const roastRoutes = require("./routes/roastRoutes");


//register middleware
app.use(cors());
app.use(express.json()) //handles incoming JSON data. parses the JSON 
// text into a JavaScript object using JSON parsing.It attaches that object
// to req.body. Your route can now access it using req.body.username, etc.

//"Whenever req beg wid /api/github,let this router handle rest of the path."
//app is main Express application,.use() tells Express to register middleware
//registering a router as middleware so Express can pass matching requests to it.
app.use("/api/github", githubRoutes); //"/api/github" =mount path, or prefix
//tells Express that req begin wid /api/github to be handled by this router.
//Router path: /:username in the router so The router matches /:username
//Extracts /:username into req.params.username & executes route callback.

app.use("/api/roast", roastRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GitShamed API is running"
  });
});

//Start the server
app.listen(PORT, () => {
  console.log(`GitShamed API running at http://localhost:${PORT}`);
});