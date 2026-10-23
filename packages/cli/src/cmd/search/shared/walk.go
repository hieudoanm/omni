package shared

import (
	"os"
	"path/filepath"
)

func WalkWithDepth(root string, depth, maxDepth int, fn filepath.WalkFunc) {
	info, err := os.Stat(root)
	if err != nil {
		fn(root, nil, err)
		return
	}
	fn(root, info, nil)
	if info.IsDir() && depth < maxDepth {
		entries, err := os.ReadDir(root)
		if err != nil {
			fn(root, nil, err)
			return
		}
		for _, entry := range entries {
			path := filepath.Join(root, entry.Name())
			fi, err := entry.Info()
			if err != nil {
				fn(path, nil, err)
				continue
			}
			if fi.IsDir() {
				WalkWithDepth(path, depth+1, maxDepth, fn)
			} else {
				fn(path, fi, nil)
			}
		}
	}
}
