#!/bin/bash

# Safe Command Wrappers for Paths with Spaces
# Handles the "Save Point Pty Ltd" directory space issue

set -e

# Get the project root directory (handles spaces properly)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Export for use in other scripts
export PROJECT_ROOT

echo "🔧 Project Root: $PROJECT_ROOT"

# Safe changeset commands that handle spaces properly
safe_changeset_add() {
    echo "🔄 Running changeset add in: $PROJECT_ROOT"
    cd "$PROJECT_ROOT"
    pnpm changeset add "$@"
}

safe_changeset_status() {
    echo "📊 Checking changeset status in: $PROJECT_ROOT"
    cd "$PROJECT_ROOT"
    pnpm changeset status "$@"
}

safe_changeset_version() {
    echo "📈 Running changeset version in: $PROJECT_ROOT"
    cd "$PROJECT_ROOT"
    pnpm changeset version "$@"
}

safe_generate_changeset() {
    echo "🤖 Generating automated changeset in: $PROJECT_ROOT"
    cd "$PROJECT_ROOT"
    ./scripts/generate-changeset.sh "$@"
}

# Command dispatcher
case "${1:-help}" in
    "add")
        shift
        safe_changeset_add "$@"
        ;;
    "status")
        shift
        safe_changeset_status "$@"
        ;;
    "version")
        shift
        safe_changeset_version "$@"
        ;;
    "generate")
        shift
        safe_generate_changeset "$@"
        ;;
    "help"|*)
        echo "🚀 Safe Command Wrapper for Z6Chat"
        echo ""
        echo "Usage: $0 <command> [args...]"
        echo ""
        echo "Commands:"
        echo "  add       - Interactive changeset creation (handles spaces)"
        echo "  status    - Check changeset status"
        echo "  version   - Generate version bump and changelog"
        echo "  generate  - Automated changeset generation"
        echo "  help      - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 add"
        echo "  $0 generate patch \"Fix authentication bug\""
        echo "  $0 generate minor \"Add new chat feature\""
        echo "  $0 status"
        ;;
esac