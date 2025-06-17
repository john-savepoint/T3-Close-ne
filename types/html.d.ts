// Type extensions for HTML attributes
declare global {
  namespace React {
    interface InputHTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      webkitdirectory?: string | undefined
    }
  }
}

export {}