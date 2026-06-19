#!/bin/bash
# Build all local-deployment projects into public/
# set -e intentionally NOT used — wget mirrors may fail transiently, we handle errors per-step
cd "$(dirname "$0")/.."

mkdir -p public
FAILED=""

echo "=== Building local projects ==="

# === tldraw (static HTML, loads from CDN) ===
if [ ! -f "public/tldraw/index.html" ] || [ "$1" = "--force" ]; then
  echo "  Setting up tldraw..."
  mkdir -p public/tldraw
  if [ ! -f "public/tldraw/index.html" ]; then
    echo "    ⚠️ tldraw index.html missing — will be created by deploy"
    FAILED="$FAILED tldraw"
  else
    echo "    Done (static HTML, no build needed)"
  fi
else
  echo "  tldraw: skip (already set up)"
fi

# === Gift Book ===
if [ ! -d "public/gift-book" ] || [ "$1" = "--force" ]; then
  echo "  Building Gift Book..."
  rm -rf public/gift-book
  if [ ! -d "_deploy/gift-book" ]; then
    git clone --depth 1 https://github.com/jingguanzhang/gift-book.git _deploy/gift-book || {
      echo "    ⚠️ git clone failed, skipping Gift Book"
      FAILED="$FAILED gift-book"
    }
  fi
  if [ -d "_deploy/gift-book" ]; then
    rm -rf _deploy/gift-book/.git _deploy/gift-book/.gitignore
    cp -r _deploy/gift-book public/gift-book
    echo "    Done"
  fi
else
  echo "  Gift Book: skip (already built)"
fi

# === HowToCook ===
if [ ! -d "public/how-to-cook" ] || [ "$1" = "--force" ]; then
  echo "  Building HowToCook..."
  rm -rf public/how-to-cook
  if [ ! -d "_deploy/how-to-cook" ]; then
    git clone --depth 1 https://github.com/Anduin2017/HowToCook.git _deploy/how-to-cook || {
      echo "    ⚠️ git clone failed, skipping HowToCook"
      FAILED="$FAILED how-to-cook"
    }
  fi
  if [ -d "_deploy/how-to-cook" ]; then
    node scripts/build-howtocook.js
    echo "    Done"
  fi
else
  echo "  HowToCook: skip (already built)"
fi

echo "=== Done ==="
if [ -n "$FAILED" ]; then
  echo "⚠️ Warnings: some projects could not be built:$FAILED"
  echo "   (previously deployed versions will be preserved)"
fi
