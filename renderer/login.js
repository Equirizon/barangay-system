const { ipcRenderer } = require("electron");

document.getElementById("login-btn").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  ipcRenderer.send("login", { username, password });
});

ipcRenderer.on("login-response", (event, response) => {
  if (response.success) {
    console.log("Login successful!");
  } else {
    document.getElementById("error-msg").textContent = response.message;
  }
});
