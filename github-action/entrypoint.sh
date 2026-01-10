#!/bin/sh
set -e

echo "::group::Intent2Commit Alignment Check"

# Run alignment check
node /check-alignment.js

ALIGNMENT_SCORE=$?

echo "::endgroup::"

# Set outputs
echo "alignment-score=$ALIGNMENT_SCORE" >> $GITHUB_OUTPUT

if [ "$FAIL_ON_LOW_ALIGNMENT" = "true" ] && [ "$ALIGNMENT_SCORE" -lt "$MIN_ALIGNMENT_SCORE" ]; then
  echo "::error::Alignment score ($ALIGNMENT_SCORE) below threshold ($MIN_ALIGNMENT_SCORE)"
  exit 1
fi

exit 0
