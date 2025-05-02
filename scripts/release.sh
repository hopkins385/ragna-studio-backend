#!/bin/bash
set -e

# Display what's happening
echo "Starting release process ..."

# Build the package
echo "Building the package..."
npm run build

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo "There are uncommitted changes in the repository."
  # Prompt user, default to Yes
  read -p "Do you want to commit these changes before releasing? (Y/n) " REPLY
  echo
  # If reply is empty (Enter) or starts with y/Y, commit changes
  if [[ -z "$REPLY" || "$REPLY" =~ ^[Yy]$ ]]; then
    read -p "Enter commit message: " commit_message
    git add .
    git commit -m "$commit_message"
    echo "Changes committed."
  # If reply starts with n/N, check if user wants to continue
  elif [[ "$REPLY" =~ ^[Nn]$ ]]; then
    echo "Please commit your changes before releasing or proceed with caution."
    # Prompt user, default to Yes
    read -p "Continue with release anyway? (Y/n) " REPLY
    echo
    # If reply starts with n/N, abort
    if [[ "$REPLY" =~ ^[Nn]$ ]]; then
      echo "Release process aborted."
      exit 1
    fi
  # Handle other inputs as needing confirmation to continue
  else
     echo "Please commit your changes before releasing or proceed with caution."
     read -p "Continue with release anyway? (Y/n) " REPLY
     echo
     if [[ "$REPLY" =~ ^[Nn]$ ]]; then
       echo "Release process aborted."
       exit 1
     fi
  fi
fi

# Run release-it
echo "Running release-it..."
npx release-it

echo "Release process completed!"

# Ask the use if he wants to execute the build script (build.sh)

# Prompt user, default to Yes
read -p "Do you want to execute the build script (build.sh)? (Y/n) " REPLY
echo
# If reply is empty (Enter) or starts with y/Y, execute build script
if [[ -z "$REPLY" || "$REPLY" =~ ^[Yy]$ ]]; then
  echo "Executing build script..."
  ./scripts/build.sh -y
  echo "Build script executed."
else
  echo "Skipping build script execution."
fi
