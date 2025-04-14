const fs = require("fs");
const path = require("path");

// Function to extract content from HTML
function extractContent(html) {
  // Find the content between the special comments
  const contentMatch = html.match(
    /<!-- START EMAIL CONTENT -->([\s\S]*?)<!-- END EMAIL CONTENT -->/
  );
  if (!contentMatch) {
    throw new Error("Could not find content section in HTML");
  }
  return contentMatch[1].trim();
}

// Main function
function main() {
  const templatesDir = path.join(__dirname, "../templates/email");
  const files = fs.readdirSync(templatesDir);

  files.forEach((file) => {
    if (file.endsWith(".html") && file !== "base.html") {
      const filePath = path.join(templatesDir, file);
      const html = fs.readFileSync(filePath, "utf8");
      const content = extractContent(html);
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Extracted content from ${file}`);
    }
  });
}

main();
