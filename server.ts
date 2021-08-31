import express, { Request, Response } from "express";
import * as path from "path";
import { Pool } from "pg";
const app = express();
const port = process.env.PORT || 3000;
const indexPath = path.join(__dirname, "./public/index.html");
app.use(express.static("public"));
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	})
);
app.get("/", (req: Request, res: Response) => res.sendFile(indexPath));

const credentials = {
	user: "postgres",
	host: "localhost",
	database: "assignment",
	password: "P@ssword@123",
	port: 5432,
};

const pool = new Pool(credentials);
enum Role {
	SuperAdmin = "SuperAdmin",
	Admin = "Admin",
	Subscriber = "Subscriber",
}

class User {
	constructor(
		public id: number,
		public fname: string,
		public mname: string,
		public lname: string,
		public email: string,
		public pno: string,
		public role: Role,
		public address: string
	) {}
}

let userData: User[] = [];

async function getAllUsers() {
	const text = `SELECT * FROM users`;
	return pool.query(text);
}

async function removeUser(userID: number) {
	const text = `DELETE FROM users WHERE id = $1`;
	const values = [userID];
	return pool.query(text, values);
}

async function addUser(user: User) {
	const text = `
      INSERT INTO users (id, fname, mname, lname, email, pno, role, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
	const values = [
		user.id,
		user.fname,
		user.mname,
		user.lname,
		user.email,
		user.pno,
		user.role,
		user.address,
	];
	return pool.query(text, values);
}

async function updateUserDetails(userId: number, newUserDetails: User) {
	const text = `UPDATE users SET fname = $2, mname = $3, lname = $4, email = $5,
	pno = $6, role = $7, address = $8 WHERE id = $1`;
	const values = [
		userId,
		newUserDetails.fname,
		newUserDetails.mname,
		newUserDetails.lname,
		newUserDetails.email,
		newUserDetails.pno,
		newUserDetails.role,
		newUserDetails.address,
	];
	return pool.query(text, values);
}

app.get("/refreshData", async (req: Request, res: Response) => {
	const getAllUsersResult = await getAllUsers();
	const data: User[] = getAllUsersResult.rows;
	userData = data;
	res.send(userData);
});

app.delete("/deleteRow", async (req: Request, res: Response) => {
	if (req.headers.id) {
		await removeUser(+req.headers.id);
		res.send("success");
	}
	res.send("failure");
});

app.post("/editRow", async (req: Request, res: Response) => {
	const fs = require("fs");
	let updatedData = [];
	let givenData = req.body;
	for (let index = 0; index < userData.length; index++) {
		const i = userData[index];
		if (i.id == givenData.id) {
			userData[index].fname = givenData.fname;
			userData[index].mname = givenData.mname;
			userData[index].lname = givenData.lname;
			userData[index].email = givenData.email;
			userData[index].pno = givenData.pno;
			userData[index].role = givenData.role;
			userData[index].address = givenData.address;
			await updateUserDetails(i.id, userData[index]);
			res.send("success!");
		}
	}
});

app.post("/addData", async (req: Request, res: Response) => {
	let maxId: number = 1;
	const getAllUsersResult = await getAllUsers();
	const data: User[] = getAllUsersResult.rows;
	userData = data;
	for (let i = 0; i < userData.length; i++)
		if (+userData[i].id >= maxId) maxId += 1;
	const newData = {
		id: maxId,
		fname: req.body.fname,
		mname: req.body.mname,
		lname: req.body.lname,
		email: req.body.email,
		pno: req.body.phoneNumber,
		role: req.body.role,
		address: req.body.address,
	};
	userData.push(newData);
	await addUser(newData);
	res.send("success");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
