.PHONY: native run-native native-test index-check
native:
	sh scripts/build-native.sh
run-native: native
	REGISTRY_SOURCE_INDEX_PREVIEW=1 REGISTRY_ROOT=$(CURDIR) ./build/native/noqeri-registry
native-test: native
	python3 -m unittest discover -s tests/native -p 'test_*.py' -v
index-check:
	python3 scripts/migrate_canonical.py --check
