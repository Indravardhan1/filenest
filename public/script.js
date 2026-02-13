const API = "/api";

async function login() {
    const regNo = document.getElementById("regNo").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regNo, password })
    });

    const data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
    } else {
        alert(data.message);
    }
}
async function loadFiles() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const res = await fetch(`${API}/files`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const files = await res.json();
    const container = document.getElementById("filesContainer");
    container.innerHTML = "";

    files.forEach(file => {
        container.innerHTML += `
            <div class="file-card">
                <p><strong>${file.originalName}</strong></p>
                <p>${(file.size / 1024).toFixed(2)} KB</p>
                <button onclick="downloadFile('${file._id}')">Download</button>
                <button onclick="deleteFile('${file._id}')" style="background:red;">Delete</button>
            </div>
        `;
    });
}

async function uploadFile() {
    const token = localStorage.getItem("token");
    const fileInput = document.getElementById("fileInput");

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    await fetch(`${API}/files/upload`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    alert("File uploaded!");
    loadFiles();
}

function downloadFile(id) {
    const token = localStorage.getItem("token");
    window.open(`${API}/files/download/${id}?token=${token}`);
}

async function deleteFile(id) {
    const token = localStorage.getItem("token");

    await fetch(`${API}/files/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    alert("Deleted!");
    loadFiles();
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
async function register() {
    const regNo = document.getElementById("regNo").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regNo, password })
    });

    const data = await res.json();

    if (data.message === "User registered successfully") {
        alert("Registration successful! Please login.");
        window.location.href = "login.html";
    } else {
        alert(data.message);
    }
}
