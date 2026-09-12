# `.nqpkg` format v1

A package artifact is a deterministic `tar.gz` stream.

Rules:

1. paths are slash-normalized and sorted lexicographically;
2. directories and files outside the declared package root are excluded;
3. modification/access/change times are zero;
4. uid/gid and user/group names are normalized;
5. file modes are normalized to `0644`;
6. gzip metadata has zero timestamp and an empty original filename;
7. the registry reports SHA-256 of the final archive bytes.

These rules make a package version content-addressable and reproducible.
