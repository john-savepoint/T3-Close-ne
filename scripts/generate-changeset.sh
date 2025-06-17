#!/bin/bash

# Automated Changeset Generator for Z6Chat
# Usage: ./scripts/generate-changeset.sh "patch|minor|major" "Description of changes"

set -e

PACKAGE_NAME="z6chat"
BUMP_TYPE="${1:-patch}"
DESCRIPTION="${2:-Automated changeset}"

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "❌ Error: Bump type must be 'patch', 'minor', or 'major'"
    echo "Usage: $0 <patch|minor|major> \"Description of changes\""
    exit 1
fi

# Validate description
if [ -z "$DESCRIPTION" ] || [ "$DESCRIPTION" = "Automated changeset" ]; then
    echo "⚠️  Warning: Using default description. Consider providing a meaningful description."
    echo "Usage: $0 $BUMP_TYPE \"Your detailed description here\""
fi

# Generate unique filename
TIMESTAMP=$(date +%s)
CHANGESET_FILE=".changeset/automated-$TIMESTAMP.md"

# Create .changeset directory if it doesn't exist
mkdir -p .changeset

# Generate changeset file
cat > "$CHANGESET_FILE" << EOF
---
"$PACKAGE_NAME": $BUMP_TYPE
---

$DESCRIPTION
EOF

echo "✅ Created changeset: $CHANGESET_FILE"
echo "📋 Type: $BUMP_TYPE"
echo "📝 Description: $DESCRIPTION"
echo ""
echo "🚀 Next steps:"
echo "   1. Review the changeset file"
echo "   2. git add $CHANGESET_FILE"
echo "   3. git commit -m \"feat: your commit message\""
echo "   4. git push"