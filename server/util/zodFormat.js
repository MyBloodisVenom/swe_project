function formatZodError(parsed) {
  if (parsed.success) return "";
  const parts = parsed.error.issues.slice(0, 4).map((issue) => {
    const label = issue.path.length ? `${issue.path.join(".")}: ` : "";
    return `${label}${issue.message}`;
  });
  return parts.join(" • ") || "Invalid input";
}

module.exports = { formatZodError };
