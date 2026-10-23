package chmod

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/internal"
)

func runChmod(filePath, modeStr string, recursive, jsonOutput bool) error {
	mode, err := internal.ParseMode(modeStr)
	if err != nil {
		return err
	}

	if recursive {
		err = filepath.Walk(filePath, func(p string, fi os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			return os.Chmod(p, mode)
		})
	} else {
		err = os.Chmod(filePath, mode)
	}
	if err != nil {
		return err
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"file":      filePath,
			"mode":      modeStr,
			"recursive": recursive,
		}, "", "  ")
		fmt.Println(string(b))
	}
	return nil
}
