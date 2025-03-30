const fs = require("fs");
const path = require("path");

// Load package.json to get the latest version
const packageJson = require("./package.json");
const version = packageJson.version;

// Define the .env file path
const envPath = path.join(__dirname, ".env");

// Read the existing .env file
let envContent = "";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf8");
}

// Replace or add REACT_APP_VERSION
const versionLine = `REACT_APP_VERSION=${version}`;
if (envContent.includes("REACT_APP_VERSION=")) {
  // Update existing REACT_APP_VERSION
  envContent = envContent.replace(/REACT_APP_VERSION=.*/g, versionLine);
} else {
  // Append if it doesn't exist
  envContent += `\n${versionLine}`;
}

// Write back to .env file
fs.writeFileSync(envPath, envContent.trim() + "\n");

console.log(`✅ Updated .env with version: ${version}`);