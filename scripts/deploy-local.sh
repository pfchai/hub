#!/bin/bash
set -e
cd "$(dirname "$0")/.."

# Gift Book — 电子礼簿 (local deployment)
if [ ! -d "public/gift-book" ]; then
  echo "Cloning Gift Book..."
  git clone --depth 1 https://github.com/jingguanzhang/gift-book.git /tmp/gift-book
  cp -r /tmp/gift-book public/gift-book/
  rm -rf /tmp/gift-book
  echo "  Done: public/gift-book/"
else
  echo "  Skip: public/gift-book/ already exists"
fi

echo "Done."
