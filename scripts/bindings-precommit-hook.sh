#!/bin/bash
IS_PYTHON=$(git diff --cached --name-only | grep "bindings/python/")
HAS_PYTEST=$(command -v pytest)

if [[ -n "$IS_PYTHON" ]]; then
  echo "Running Python pre-commit hook"

  if [[ -z "$HAS_PYTEST" ]]; then
    echo "pytest is not installed. See the pydeck README."
    exit 1
  fi

  python3 -m pytest bindings/python/pydeck/tests/
  echo "Running flake8..."
  (cd bindings/python/pydeck && python3 -m flake8 bindings/python/pydeck)
fi
RESULT=$?
[ $RESULT -ne 0 ] && exit 1

exit 0
