.PHONY: push

# Workaround for https://github.com/google/clasp/issues/872
push:
	while true; do npx clasp push && break; done
