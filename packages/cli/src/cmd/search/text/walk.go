package text

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/search/shared"
)

func walkTextFile(re *regexp.Regexp, root string, maxDepth int, include *regexp.Regexp, results *[]textMatch, maxCount int, seen map[string]bool) {
	walkFn := func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() {
			return nil
		}
		if include != nil && !include.MatchString(fi.Name()) {
			return nil
		}
		matches := searchFileText(path, "", re, maxCount)
		for _, m := range matches {
			key := m.File + ":" + m.Content
			if seen[key] {
				continue
			}
			seen[key] = true
			*results = append(*results, m)
			if maxCount > 0 && len(*results) >= maxCount {
				return fmt.Errorf("done")
			}
		}
		return nil
	}

	if maxDepth > 0 {
		shared.WalkWithDepth(root, 0, maxDepth, walkFn)
	} else {
		filepath.Walk(root, walkFn)
	}
}
