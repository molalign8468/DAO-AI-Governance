export function formatJustificationWithBullets(text) {
  if (!text) return "";

  return text
    .replace(/^\s*\*\*\s*(.*?)\s*\*\*/gm, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1") 
    .replace(/^\s*-\s*/gm, "• ") 
    .replace(/^\s*\*\s*/gm, "• ")
    .replace(/\s+/g, " ")
    .replace(/• /g, "\n• ")
    .trim();
}
