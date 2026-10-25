.PHONY: native run run-native native-test index-check
native:
	sh scripts/build-native.sh
run: run-native
run-native: native
	sh scripts/run-noqeri.sh
native-test: native
	python3 -m unittest discover -s tests/native -p 'test_*.py' -v
index-check:
	python3 scripts/migrate_canonical.py --check
