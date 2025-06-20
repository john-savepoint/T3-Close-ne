// Re-export lightweight logger as the default
// This prevents file system operations that slow down the app
export * from "./logger-light"
export { default } from "./logger-light"
