package ftype

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/internal"
)

func runType(filePath string, jsonOutput bool) error {
	info, err := os.Stat(filePath)
	if err != nil {
		return err
	}
	mime := internal.DetectMIME(filePath)

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"file":     filePath,
			"size":     info.Size(),
			"mime":     mime,
			"mode":     info.Mode().String(),
			"modified": info.ModTime().Format("2006-01-02T15:04:05Z"),
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Printf("File     : %s\n", filePath)
		fmt.Printf("Size     : %s\n", internal.FormatSize(info.Size()))
		fmt.Printf("MIME     : %s\n", mime)
		fmt.Printf("Mode     : %s\n", info.Mode())
		if !info.IsDir() {
			fmt.Printf("Modified : %s\n", info.ModTime().Format("2006-01-02 15:04:05"))
		}
	}
	return nil
}
