import express from 'express';
import pool from './db.js';
import  dotenv from 'dotenv';



dotenv.config()



const app = express();
const PORT = 3000;

app.set("view engine", "ejs")
app.set("views", "./view")
app.use(express.json());

app.use(express.urlencoded({extended:true}))





app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
