const fixedUsername = "admin";
const fixedPassword = "123"; 

const TOKEN_KEY = "admin_auth_token"; 

const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const logoutButton = document.getElementById("logout-button");
const adminNavLinks = document.querySelectorAll(".admin-nav a");
const contentArea = document.getElementById("content-area");

let clientes = [];
let encomendas = []; 
let rotas = [];
let entregas = [];
let centros = []; 

//autenticacao

function checkAuth() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token === "authenticated") { 
        showAdminPanel();
    } else {
        showLogin();
    }
}

function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;

    if (usernameInput === fixedUsername && passwordInput === fixedPassword) {
        localStorage.setItem(TOKEN_KEY, "authenticated");
        showAdminPanel();
    } else {
        loginMessage.textContent = "Usuário ou senha incorretos.";
        loginMessage.style.display = "block";
    }
}

function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    showLogin();
    alert("Você foi desconectado.");
}

function showLogin() {
    loginSection.classList.remove("hidden");
    adminPanel.classList.add("hidden");
    loginMessage.textContent = ""; 
    loginForm.reset(); 
}

function showAdminPanel() {
    loginSection.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    loadSection("clientes");
    loadAllData();
}

loginForm.addEventListener("submit", handleLogin);
logoutButton.addEventListener("click", handleLogout);

adminNavLinks.forEach(link => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const sectionId = event.target.dataset.section;
        loadSection(sectionId);
    });
});

document.addEventListener("DOMContentLoaded", checkAuth);