export function triggerDownload(content: string, filename: string, mimeType: string): void {
  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)

    // Create temporary download link
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.style.display = "none"

    // Trigger download
    document.body.appendChild(a)
    a.click()

    // Cleanup
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Failed to trigger download:", error)
    throw new Error("Download failed. Please try again.")
  }
}

export function downloadAsMarkdown(content: string, filename: string): void {
  const sanitizedFilename = filename.endsWith(".md") ? filename : `${filename}.md`
  triggerDownload(content, sanitizedFilename, "text/markdown")
}

export function downloadAsPlainText(content: string, filename: string): void {
  const sanitizedFilename = filename.endsWith(".txt") ? filename : `${filename}.txt`
  triggerDownload(content, sanitizedFilename, "text/plain")
}

export function downloadAsJSON(content: string, filename: string): void {
  const sanitizedFilename = filename.endsWith(".json") ? filename : `${filename}.json`
  triggerDownload(content, sanitizedFilename, "application/json")
}

// Future PDF download function
export async function downloadAsPDF(pdfBlob: Blob, filename: string): Promise<void> {
  const sanitizedFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`
  const url = URL.createObjectURL(pdfBlob)

  const a = document.createElement("a")
  a.href = url
  a.download = sanitizedFilename
  a.style.display = "none"

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
