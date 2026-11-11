package shared

import (
	"os"
	"path/filepath"
)

// WalkWithDepth walks root like filepath.Walk but only descends to maxDepth
// levels. It honors the callback's return value: filepath.SkipDir prunes a
// directory, and any other non-nil error stops the walk and is returned.
func WalkWithDepth(root string, depth, maxDepth int, fn filepath.WalkFunc) error {
	info, err := os.Stat(root)
	if err != nil {
		return fn(root, nil, err)
	}
	if err := fn(root, info, nil); err != nil {
		return err
	}
	return walkDir(root, info, depth, maxDepth, fn)
}

func walkDir(root string, info os.FileInfo, depth, maxDepth int, fn filepath.WalkFunc) error {
	if !info.IsDir() || depth >= maxDepth {
		return nil
	}
	entries, err := os.ReadDir(root)
	if err != nil {
		return fn(root, nil, err)
	}
	for _, entry := range entries {
		path := filepath.Join(root, entry.Name())
		fi, err := entry.Info()
		if err != nil {
			if fnErr := fn(path, nil, err); fnErr != nil && fnErr != filepath.SkipDir {
				return fnErr
			}
			continue
		}
		if err := fn(path, fi, nil); err != nil {
			if err == filepath.SkipDir {
				continue
			}
			return err
		}
		if fi.IsDir() {
			if err := walkDir(path, fi, depth+1, maxDepth, fn); err != nil {
				return err
			}
		}
	}
	return nil
}
