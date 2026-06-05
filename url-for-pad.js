/**
 * Generate a Scratch Pad URL with markdown content.
 *
 * Usage:
 *   node url-for-pad.js "# Hello\n\nWorld"
 *   echo "# Hello\n\nWorld" | node url-for-pad.js
 *   node url-for-pad.js --name notes "# My notes"
 */

const BASE = "https://scratch-pad-beryl.vercel.app"

function urlForPad(markdown, name) {
  const url = new URL(BASE + (name ? `/${encodeURIComponent(name)}` : "/"))
  url.searchParams.set("md", markdown)
  return url.toString()
}

// --- CLI ---
const args = process.argv.slice(2)
let name, input

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--name" && i + 1 < args.length) {
    name = args[i + 1]
    i++
  } else {
    input = args[i]
  }
}

if (input) {
  console.log(urlForPad(input, name))
} else if (!process.stdin.isTTY) {
  // Read from stdin
  let data = ""
  process.stdin.on("readable", () => {
    const chunk = process.stdin.read()
    if (chunk) data += chunk
  })
  process.stdin.on("end", () => {
    console.log(urlForPad(data.trimEnd(), name))
  })
} else {
  console.error("Usage: node url-for-pad.js [--name sheet-name] '# Your markdown'")
  console.error("   or: cat file.md | node url-for-pad.js [--name sheet-name]")
  process.exit(1)
}
