package size

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/internal"
)

func runSize(path string, jsonOutput bool) error {
	info, err := os.Stat(path)
	if err != nil {
		return err
	}
	if info.IsDir() {
		var total int64
		filepath.Walk(path, func(p string, fi os.FileInfo, err error) error {
			if err != nil {
				return nil
			}
			total += fi.Size()
			return nil
		})
		if jsonOutput {
			b, _ := json.MarshalIndent(map[string]interface{}{
				"path": path,
				"size": total,
			}, "", "  ")
			fmt.Println(string(b))
		} else {
			fmt.Printf("%s  %s\n", internal.FormatSize(total), path)
		}
	} else {
		if jsonOutput {
			b, _ := json.MarshalIndent(map[string]interface{}{
				"path": path,
				"size": info.Size(),
			}, "", "  ")
			fmt.Println(string(b))
		} else {
			fmt.Printf("%s  %s\n", internal.FormatSize(info.Size()), path)
		}
	}
	return nil
}
