const {
    readFile
} = require("fs/promises");
const {
    readFileSync
} = require("fs");

const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../db/connect.js");
const Employee = require("../models/Employee.js");

async function start() {
    try {
        //   * Connect to atlas db
        await connectDB("mongodb+srv://admin-zoran:Moeko2023@cluster0.0ls0bus.mongodb.net/REACT-BOOTSTRAP-WEBSITE-API?retryWrites=true&w=majority");

        const jsonData = JSON.parse(await readFileSync("./mock-data.json", "utf8"));
        await Employee.deleteMany();
        await Employee.create(jsonData);

        console.log("Mock data added");
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

start();