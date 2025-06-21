/**
 * Safe clipboard operations that handle document focus issues
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Check if document has focus
    if (!document.hasFocus()) {
      // Try to focus the window first
      window.focus()
      
      // If still no focus, use fallback method
      if (!document.hasFocus()) {
        return copyToClipboardFallback(text)
      }
    }

    // Try modern clipboard API
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.warn('Clipboard API failed, trying fallback:', error)
    return copyToClipboardFallback(text)
  }
}

function copyToClipboardFallback(text: string): boolean {
  try {
    // Create a textarea element
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'
    
    document.body.appendChild(textarea)
    
    // Focus and select the text
    textarea.focus()
    textarea.select()
    
    // Try to copy
    const success = document.execCommand('copy')
    
    // Clean up
    document.body.removeChild(textarea)
    
    return success
  } catch (error) {
    console.error('Fallback copy failed:', error)
    return false
  }
}