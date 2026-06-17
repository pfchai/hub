#!/bin/bash
# Build all local-deployment projects into public/
# set -e intentionally NOT used — wget mirrors may fail transiently, we handle errors per-step
cd "$(dirname "$0")/.."

mkdir -p public
FAILED=""

echo "=== Building local projects ==="

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

# === Excalidraw (wget mirror with retries) ===
if [ ! -d "public/excalidraw" ] || [ "$1" = "--force" ]; then
  echo "  Building Excalidraw (downloading built site)..."
  rm -rf public/excalidraw _deploy/excalidraw-site
  wget -q --mirror --convert-links --page-requisites --no-parent \
       --tries=3 --timeout=30 --waitretry=10 \
       --directory-prefix=_deploy/excalidraw-site https://excalidraw.com/ || true
  if [ -d "_deploy/excalidraw-site/excalidraw.com" ]; then
    cp -r _deploy/excalidraw-site/excalidraw.com public/excalidraw
    rm -rf _deploy/excalidraw-site
    echo "    Done"
  else
    echo "    ⚠️ wget mirror failed, skipping Excalidraw (will use last deployed version)"
    FAILED="$FAILED excalidraw"
  fi
else
  echo "  Excalidraw: skip (already built)"
fi

# === Slidev (wget mirror with retries) ===
if [ ! -d "public/slidev" ] || [ "$1" = "--force" ]; then
  echo "  Building Slidev (downloading built site)..."
  rm -rf public/slidev _deploy/slidev-site
  wget -q --mirror --convert-links --page-requisites --no-parent \
       --tries=3 --timeout=30 --waitretry=10 \
       --directory-prefix=_deploy/slidev-site https://sli.dev/ || true
  if [ -d "_deploy/slidev-site/sli.dev" ]; then
    cp -r _deploy/slidev-site/sli.dev public/slidev
    rm -rf _deploy/slidev-site
    echo "    Done"
  else
    echo "    ⚠️ wget mirror failed, skipping Slidev (will use last deployed version)"
    FAILED="$FAILED slidev"
  fi
else
  echo "  Slidev: skip (already built)"
fi

echo "=== Done ==="
if [ -n "$FAILED" ]; then
  echo "⚠️ Warnings: some projects could not be built:$FAILED"
  echo "   (previously deployed versions will be preserved)"
fi
