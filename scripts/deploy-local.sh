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

# === tldraw (curl-based mirror with retries) ===
if [ ! -d "public/tldraw" ] || [ "$1" = "--force" ]; then
  echo "  Building tldraw (fetching built site)..."
  rm -rf public/tldraw _deploy/tldraw-site
  mkdir -p _deploy/tldraw-site/www.tldraw.com/assets

  # Step 1: Download index.html
  curl -sL --retry 3 --retry-delay 10 --max-time 30 \
       -o _deploy/tldraw-site/www.tldraw.com/index.html \
       https://www.tldraw.com/ || true

  if [ -f "_deploy/tldraw-site/www.tldraw.com/index.html" ]; then
    # Step 2: Extract asset URLs (relative or absolute) from index.html and download them
    (perl -nle 'print $1 while /(?:src|href)="https:\/\/www\.tldraw\.com\/([^"]+)"/g' \
       _deploy/tldraw-site/www.tldraw.com/index.html 2>/dev/null
     perl -nle 'print $1 while /(?:src|href)="\/((?:assets|cf-fonts)\/[^"]+\.(?:js|css|woff2|svg|png|ico|webmanifest))"/g' \
       _deploy/tldraw-site/www.tldraw.com/index.html 2>/dev/null
     perl -nle 'print $1 while /(?:src|href)="\/((?:theme-init|favicon|manifest|apple-touch-icon|robots)[^"]+)"/g' \
       _deploy/tldraw-site/www.tldraw.com/index.html 2>/dev/null) | sort -u | \
      while read -r path; do
        dir=$(dirname "_deploy/tldraw-site/www.tldraw.com/$path")
        mkdir -p "$dir"
        curl -sL --retry 2 --max-time 15 \
             -o "_deploy/tldraw-site/www.tldraw.com/$path" \
             "https://www.tldraw.com/$path" 2>/dev/null || true
      done

    # Step 3: Extract chunk refs from main JS and download
    MAIN_JS=$(perl -nle 'print $1 if /src="\/?(assets\/index-[A-Za-z0-9]+\.js)"/' \
      _deploy/tldraw-site/www.tldraw.com/index.html | head -1)
    if [ -n "$MAIN_JS" ] && [ -f "_deploy/tldraw-site/www.tldraw.com/$MAIN_JS" ]; then
      perl -nle 'print $1 while /"(assets\/[^"]+\.(?:js|css))"/g' \
        "_deploy/tldraw-site/www.tldraw.com/$MAIN_JS" | sort -u | \
        while read -r chunk; do
          dir=$(dirname "_deploy/tldraw-site/www.tldraw.com/$chunk")
          mkdir -p "$dir"
          curl -sL --retry 2 --max-time 15 \
               -o "_deploy/tldraw-site/www.tldraw.com/$chunk" \
               "https://www.tldraw.com/$chunk" 2>/dev/null || true
        done
    fi

    # Step 4: Rewrite absolute URLs to relative in index.html
    sed -i '' 's|https://www\.tldraw\.com/|/|g' \
      _deploy/tldraw-site/www.tldraw.com/index.html 2>/dev/null || \
    sed -i 's|https://www\.tldraw\.com/|/|g' \
      _deploy/tldraw-site/www.tldraw.com/index.html 2>/dev/null || true

    # Step 5: Copy to public
    cp -r _deploy/tldraw-site/www.tldraw.com public/tldraw
    rm -rf _deploy/tldraw-site
    echo "    Done ($(find public/tldraw -type f | wc -l | tr -d ' ') files)"
  else
    echo "    ⚠️ curl fetch failed, skipping tldraw (will use last deployed version)"
    FAILED="$FAILED tldraw"
  fi
else
  echo "  tldraw: skip (already built)"
fi

echo "=== Done ==="
if [ -n "$FAILED" ]; then
  echo "⚠️ Warnings: some projects could not be built:$FAILED"
  echo "   (previously deployed versions will be preserved)"
fi
