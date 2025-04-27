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
  read -p "Do you want to commit these changes before releasing? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter commit message: " commit_message
    git add .
    git commit -m "$commit_message"
    echo "Changes committed."
  else
    echo "Please commit your changes before releasing or proceed with caution."
    read -p "Continue with release anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Release process aborted."
      exit 1
    fi
  fi
fi

# Run release-it
echo "Running release-it..."
npx release-it

echo "Release process completed!"
