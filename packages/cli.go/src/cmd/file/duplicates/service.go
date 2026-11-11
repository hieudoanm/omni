package duplicates

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"

	"github.com/hieudoanm/omni/packages/cli.go/src/cmd/file/internal"
)

func runDuplicates(dir string, minSize int64, jsonOutput bool) error {
	bySize := make(map[int64][]string)
	filepath.Walk(dir, func(path string, fi os.FileInfo, err error) error {
		if err != nil {
			fmt.Fprintf(os.Stderr, "error accessing %s: %v\n", path, err)
			return nil
		}
		if fi.IsDir() || fi.Size() < minSize {
			return nil
		}
		bySize[fi.Size()] = append(bySize[fi.Size()], path)
		return nil
	})

	var dupGroups []map[string]interface{}

	sizes := make([]int64, 0, len(bySize))
	for size := range bySize {
		sizes = append(sizes, size)
	}
	sort.Slice(sizes, func(i, j int) bool { return sizes[i] > sizes[j] })

	for _, size := range sizes {
		paths := bySize[size]
		if len(paths) < 2 {
			continue
		}
		byHash := make(map[string][]string)
		for _, p := range paths {
			h, err := internal.QuickHash(p)
			if err != nil {
				continue
			}
			byHash[h] = append(byHash[h], p)
		}
		hashes := make([]string, 0, len(byHash))
		for h := range byHash {
			hashes = append(hashes, h)
		}
		sort.Strings(hashes)
		for _, h := range hashes {
			dups := byHash[h]
			if len(dups) < 2 {
				continue
			}
			if jsonOutput {
				dupGroups = append(dupGroups, map[string]interface{}{
					"size":  size,
					"files": dups,
				})
			} else {
				fmt.Printf("Duplicates (%s each):\n", internal.FormatSize(size))
				for _, d := range dups {
					fmt.Printf("  %s\n", d)
				}
				fmt.Println()
			}
		}
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(dupGroups, "", "  ")
		fmt.Println(string(b))
	} else if len(dupGroups) == 0 {
		fmt.Println("No duplicates found.")
	}
	return nil
}
