#!/bin/bash
# Build all local-deployment projects into public/
set -e
cd "$(dirname "$0")/.."

echo "=== Building local projects ==="

# === Gift Book ===
if [ ! -d "public/gift-book" ] || [ "$1" = "--force" ]; then
  echo "  Building Gift Book..."
  rm -rf public/gift-book
  if [ ! -d "_deploy/gift-book" ]; then
    git clone --depth 1 https://github.com/jingguanzhang/gift-book.git _deploy/gift-book
  fi
  rm -rf _deploy/gift-book/.git _deploy/gift-book/.gitignore
  cp -r _deploy/gift-book public/gift-book
  echo "    Done"
else
  echo "  Gift Book: skip (already built)"
fi

# === HowToCook ===
if [ ! -d "public/how-to-cook" ] || [ "$1" = "--force" ]; then
  echo "  Building HowToCook..."
  rm -rf public/how-to-cook
  if [ ! -d "_deploy/how-to-cook" ]; then
    git clone --depth 1 https://github.com/Anduin2017/HowToCook.git _deploy/how-to-cook
  fi
  node scripts/build-howtocook.js
  echo "    Done"
else
  echo "  HowToCook: skip (already built)"
fi

# === Excalidraw ===
if [ ! -d "public/excalidraw" ] || [ "$1" = "--force" ]; then
  echo "  Building Excalidraw (downloading built site)..."
  rm -rf public/excalidraw _deploy/excalidraw-site
  wget -q --mirror --convert-links --page-requisites --no-parent \
       --directory-prefix=_deploy/excalidraw-site https://excalidraw.com/
  cp -r _deploy/excalidraw-site/excalidraw.com public/excalidraw
  rm -rf _deploy/excalidraw-site
  echo "    Done"
else
  echo "  Excalidraw: skip (already built)"
fi

# === Slidev ===
if [ ! -d "public/slidev" ] || [ "$1" = "--force" ]; then
  echo "  Building Slidev (downloading built site)..."
  rm -rf public/slidev _deploy/slidev-site
  wget -q --mirror --convert-links --page-requisites --no-parent \
       --directory-prefix=_deploy/slidev-site https://sli.dev/
  cp -r _deploy/slidev-site/sli.dev public/slidev
  rm -rf _deploy/slidev-site
  echo "    Done"
else
  echo "  Slidev: skip (already built)"
fi

echo "=== Done ==="
