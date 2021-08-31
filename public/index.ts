// First name, Middle name, Last name, email, phone number, role, address

import { data } from "jquery";

class User {
	constructor(
		public id: number,
		public fname: string,
		public mname: string,
		public lname: string,
		public email: string,
		public pno: string,
		public role: Role | string,
		public address: string
	) {}
}

enum Role {
	SuperAdmin = "SuperAdmin",
	Admin = "Admin",
	Subscriber = "Subscriber",
}

interface roleObject {
	superAdmin: HTMLInputElement;
	admin: HTMLInputElement;
	subscriber: HTMLInputElement;
}

const getData = () => {
	$.ajax({
		url: "http://localhost:3000/refreshData",
		success: function (result) {
			fillTable(result);
		},
	});
};

let editRowElement: string[];

const fillTable = (data: User[]) => {
	const users: User[] = data;
	console.log(users);

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		const id = user.id;
		document.getElementById("tableBody")!.innerHTML += `<tr id="row${id}">
            <td><div class="row${id}">${user.fname}</div></td>
            <td><div class="row${id}">${user.mname}</div></td>
            <td><div class="row${id}">${user.lname}</div></td>
            <td><div class="row${id}">${user.email}</div></td>
            <td><div class="row${id}">${user.pno}</div></td>
            <td><div class="row${id}">${user.role}</div></td>
            <td><div class="row${id}">${user.address}</div></td>
            <td><button id="editRow${id}" type="button" onclick="editRow(${id})" class="btn btn-success">Edit</button></td>
            <td><button id="deleteRow${id}" type="button" onclick="deleteData(${id})" class="btn btn-danger delete${id}">Delete</button></td>
        </tr>`;
	}
};

const editRow = (rowID: number | string) => {
	const row = document.getElementsByClassName(
		"row" + rowID
	) as unknown as HTMLElement[];
	editRowElement = [];
	for (let i = 0; i < row.length; i++) {
		row[i].contentEditable = "true";
		editRowElement.push(row[i].innerHTML);
	}

	const editButton = document.getElementById("editRow" + rowID);
	if (editButton) {
		editButton.innerHTML = "Save";
		editButton.setAttribute("onclick", "saveRow(" + rowID + ")");
	}

	const deleteButton = document.getElementById("deleteRow" + rowID);
	if (deleteButton) {
		deleteButton.innerHTML = "Cancel";
		deleteButton.setAttribute("onclick", "cancelRowEdit(" + rowID + ")");
	}
};

const cancelRowEdit = (id: number | string) => {
	let row = document.getElementsByClassName(
		"row" + id
	) as unknown as HTMLElement[];
	for (let i = 0; i < 7; i++) {
		row[i].innerHTML = editRowElement[i];
		row[i].contentEditable = "false";
	}

	const editButton = document.getElementById("editRow" + id);
	if (editButton) {
		editButton.innerHTML = "Edit";
		editButton.setAttribute("onclick", "editRow(" + id + ")");
	}

	const deleteButton = document.getElementById("deleteRow" + id);
	if (deleteButton) {
		deleteButton.innerHTML = "Delete";
		deleteButton.setAttribute("onclick", "deleteData(" + id + ")");
	}
};

const saveRow = (id: number | string) => {
	const row = document.getElementsByClassName(
		"row" + id
	) as unknown as HTMLElement[];

	let newRowData: User = {
		id: +id,
		fname: "",
		mname: "",
		lname: "",
		email: "",
		pno: "",
		role: "",
		address: "",
	};

	for (let i = 0; i < row.length; i++) {
		row[i].contentEditable = "false";
	}
	newRowData.fname = row[0].innerText;
	newRowData.mname = row[1].innerText;
	newRowData.lname = row[2].innerText;
	newRowData.email = row[3].innerText;
	newRowData.pno = row[4].innerText;
	newRowData.role = row[5].innerText;
	newRowData.address = row[6].innerText;
	console.log(newRowData);

	$.ajax({
		url: "http://localhost:3000/editRow",
		type: "POST",
		data: newRowData,
		success: function (result) {
			console.log(result);
			if (result === "success") {
				refreshData();
			}
		},
	});

	const editButton = document.getElementById("editRow" + id);
	if (editButton) {
		editButton.innerHTML = "Edit";
		editButton.setAttribute("onclick", "editRow(" + id + ")");
	}

	const deleteButton = document.getElementById("deleteRow" + id);
	if (deleteButton) {
		deleteButton.innerHTML = "Delete";
		deleteButton.setAttribute("onclick", "deleteData(" + id + ")");
	}
};

const deleteData = (id: number | string) => {
	const rowReferenceID = '{ "id": ' + id + " }";
	$.ajax({
		url: "http://localhost:3000/deleteRow",
		type: "DELETE",
		headers: JSON.parse(rowReferenceID),
		success: function (result) {
			console.log(result);
			if (result === "success") {
				refreshData();
			}
		},
	});
};

const loadData = () => {
	getData();
	const loadData = document.getElementById("loadData")!;

	loadData.innerHTML = "Refresh Data";
	loadData.id = "refreshData";
	document
		.getElementById("refreshData")!
		.setAttribute("onclick", "refreshData()");
};

const refreshData = () => {
	document.getElementById("tableBody")!.innerHTML = "";
	getData();
};

const addData = () => {
	let fname: HTMLInputElement = <HTMLInputElement>(
		document.getElementById("firstNameInput")!
	);
	let mname: HTMLInputElement = <HTMLInputElement>(
		document.getElementById("middleNameInput")!
	);
	let lname: HTMLInputElement = <HTMLInputElement>(
		document.getElementById("lastNameInput")!
	);
	let email: HTMLInputElement = <HTMLInputElement>(
		document.getElementById("emailInput")!
	);
	let phoneNumber: HTMLInputElement = <HTMLInputElement>(
		document.getElementById("phoneNumberInput")!
	);
	let role: roleObject = {
		superAdmin: <HTMLInputElement>document.getElementById("superAdmin")!,
		admin: <HTMLInputElement>document.getElementById("admin")!,
		subscriber: <HTMLInputElement>document.getElementById("subscriber")!,
	};
	let address: HTMLInputElement = <HTMLInputElement>(
		document.getElementById("addressInput")!
	);
	let dataObject;
	if (role.superAdmin.checked) {
		dataObject = {
			fname: fname.value,
			mname: mname.value,
			lname: lname.value,
			email: email.value,
			phoneNumber: phoneNumber.value,
			role: "Super Admin",
			address: address.value,
		};
	} else if (role.admin.checked) {
		dataObject = {
			fname: fname.value,
			mname: mname.value,
			lname: lname.value,
			email: email.value,
			phoneNumber: phoneNumber.value,
			role: "Admin",
			address: address.value,
		};
	} else {
		dataObject = {
			fname: fname.value,
			mname: mname.value,
			lname: lname.value,
			email: email.value,
			phoneNumber: phoneNumber.value,
			role: "Subscriber",
			address: address.value,
		};
	}
	$.ajax({
		url: "http://localhost:3000/addData",
		type: "POST",
		data: dataObject,
		success: function (result) {
			console.log(result);
			if (result === "success") {
				refreshData();
				fname.value = "";
				mname.value = "";
				lname.value = "";
				email.value = "";
				phoneNumber.value = "";
				address.value = "";
			}
		},
	});
};
