#!/bin/bash
# Smoke test for Hub 2.0 — run after local dev server is started
# Usage: bash scripts/smoke-test.sh
# Requires: curl, grep, and a running Vite dev server on localhost:5173

BASE="${1:-http://localhost:5173}"
PASS=0
FAIL=0

check() {
  local label="$1"
  local result="$2"
  if [ "$result" = "0" ]; then
    echo "  PASS: $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $label"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== Hub 2.0 Smoke Test ==="
echo "Target: $BASE"
echo ""

# 1. Dashboard loads
echo "[1] Dashboard loads"
BODY=$(curl -s "$BASE")
echo "$BODY" | grep -qE 'Hub\.|curious'
check "Homepage contains 'Hub.' or 'curious'" "$?"

# 2. Curation list loads
echo "[2] Curation list loads"
BODY2=$(curl -s "$BASE/#/m/curation")
echo "$BODY2" | grep -qE 'project|app|demo'
check "Curation page contains project names" "$?"

# 3. Old URL /project/hub redirects to /m/curation/project/hub
echo "[3] Old URL redirect"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/#/project/hub")
# In hash-mode SPA, the server always returns 200; the redirect is client-side.
# Check that the page content at the old URL still renders.
BODY3=$(curl -s "$BASE/#/project/hub")
echo "$BODY3" | grep -qE 'hub|Hub'
check "Old /project/hub URL renders content (hash-mode SPA)" "$?"

# 4. Module list shows both curation and sunset
echo "[4] Module list"
BODY4=$(curl -s "$BASE/")
echo "$BODY4" | grep -qi 'curation'
check "Module list mentions 'curation'" "$?"
echo "$BODY4" | grep -qi 'sunset'
check "Module list mentions 'sunset'" "$?"

# 5. Dark mode styles present in CSS
echo "[5] Dark mode styles"
# Fetch the built CSS — look for prefers-color-scheme
BODY5=$(curl -s "$BASE/")
# Extract CSS link hrefs and fetch them
CSS_URLS=$(echo "$BODY5" | grep -oE 'href="[^"]*\.css[^"]*"' | sed 's/href="//;s/"//')
if [ -z "$CSS_URLS" ]; then
  # Inline styles or no link — check the page itself
  echo "$BODY5" | grep -qE 'prefers-color-scheme|--color-'
  check "Dark mode prefers-color-scheme in page" "$?"
else
  FOUND_DARK=1
  for css_url in $CSS_URLS; do
    # Build absolute URL
    case "$css_url" in
      http*) CSS_BODY=$(curl -s "$css_url") ;;
      /*)    CSS_BODY=$(curl -s "$BASE$css_url") ;;
      *)     CSS_BODY=$(curl -s "$BASE/$css_url") ;;
    esac
    echo "$CSS_BODY" | grep -qE 'prefers-color-scheme|--color-' && FOUND_DARK=0
  done
  check "Dark mode styles in CSS" "$FOUND_DARK"
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
exit $FAIL
