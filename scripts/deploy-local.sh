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

# === learnGitBranching ===
if [ ! -d "public/learnGitBranching" ] || [ "$1" = "--force" ]; then
  echo "  Building learnGitBranching..."
  rm -rf public/learnGitBranching
  if [ ! -d "_deploy/learnGitBranching" ]; then
    git clone --depth 1 https://github.com/pcottle/learnGitBranching.git _deploy/learnGitBranching || {
      echo "    ⚠️ git clone failed, skipping learnGitBranching"
      FAILED="$FAILED learnGitBranching"
    }
  fi
  if [ -d "_deploy/learnGitBranching" ]; then
    cd _deploy/learnGitBranching
    npm install --ignore-scripts --silent 2>/dev/null || true
    npx gulp fastBuild 2>/dev/null || true
    cd ../..
    mkdir -p public/learnGitBranching/build
    cp _deploy/learnGitBranching/index.html public/learnGitBranching/ 2>/dev/null || true
    cp _deploy/learnGitBranching/build/bundle-*.js public/learnGitBranching/build/ 2>/dev/null || true
    cp _deploy/learnGitBranching/build/main-*.css public/learnGitBranching/build/ 2>/dev/null || true
    cp -r _deploy/learnGitBranching/assets public/learnGitBranching/ 2>/dev/null || true
    echo "    Done"
  fi
else
  echo "  learnGitBranching: skip (already built)"
fi

# === impress.js ===
if [ ! -d "public/impress.js" ] || [ "$1" = "--force" ]; then
  echo "  Building impress.js..."
  rm -rf public/impress.js
  if [ ! -d "_deploy/impress.js" ]; then
    git clone --depth 1 https://github.com/impress/impress.js.git _deploy/impress.js || {
      echo "    ⚠️ git clone failed, skipping impress.js"
      FAILED="$FAILED impress.js"
    }
  fi
  if [ -d "_deploy/impress.js" ]; then
    mkdir -p public/impress.js
    cp _deploy/impress.js/index.html public/impress.js/ 2>/dev/null || true
    cp -r _deploy/impress.js/js public/impress.js/ 2>/dev/null || true
    cp -r _deploy/impress.js/css public/impress.js/ 2>/dev/null || true
    cp -r _deploy/impress.js/examples public/impress.js/ 2>/dev/null || true
    echo "    Done"
  fi
else
  echo "  impress.js: skip (already built)"
fi

# === TodoMVC ===
if [ ! -d "public/todomvc" ] || [ "$1" = "--force" ]; then
  echo "  Building TodoMVC..."
  rm -rf public/todomvc
  if [ ! -d "_deploy/todomvc" ]; then
    git clone --depth 1 https://github.com/tastejs/todomvc.git _deploy/todomvc || {
      echo "    ⚠️ git clone failed, skipping TodoMVC"
      FAILED="$FAILED todomvc"
    }
  fi
  if [ -d "_deploy/todomvc" ]; then
    cp -r _deploy/todomvc public/todomvc
    rm -rf public/todomvc/.git public/todomvc/cypress public/todomvc/tests public/todomvc/.github public/todomvc/node_modules 2>/dev/null || true
    find public/todomvc -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    rm -rf public/todomvc/bower_components 2>/dev/null || true
    echo "    Done"
  fi
else
  echo "  TodoMVC: skip (already built)"
fi

# === Editor.md ===
if [ ! -d "public/editor-md" ] || [ "$1" = "--force" ]; then
  echo "  Building Editor.md..."
  rm -rf public/editor-md
  if [ ! -d "_deploy/editor.md" ]; then
    git clone --depth 1 https://github.com/pandao/editor.md.git _deploy/editor.md || {
      echo "    ⚠️ git clone failed, skipping Editor.md"
      FAILED="$FAILED editor-md"
    }
  fi
  if [ -d "_deploy/editor.md" ]; then
    mkdir -p public/editor-md
    cp -r _deploy/editor.md/examples public/editor-md/ 2>/dev/null || true
    cp -r _deploy/editor.md/css public/editor-md/ 2>/dev/null || true
    cp -r _deploy/editor.md/src public/editor-md/ 2>/dev/null || true
    cp -r _deploy/editor.md/lib public/editor-md/ 2>/dev/null || true
    cp -r _deploy/editor.md/languages public/editor-md/ 2>/dev/null || true
    cp -r _deploy/editor.md/plugins public/editor-md/ 2>/dev/null || true
    cp _deploy/editor.md/editormd.js _deploy/editor.md/editormd.min.js _deploy/editor.md/editormd.amd.js public/editor-md/ 2>/dev/null || true
    # Index page is committed statically (public/editor-md/index.html)
    echo "    Done"
  fi
else
  echo "  Editor.md: skip (already built)"
fi

echo "=== Done ==="
if [ -n "$FAILED" ]; then
  echo "⚠️ Warnings: some projects could not be built:$FAILED"
  echo "   (previously deployed versions will be preserved)"
fi
