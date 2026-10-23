package read

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/internal"
)

func readFileContent(path string, offset, lines int) (string, []string, int, error) {
	info, err := os.Stat(path)
	if err != nil {
		return "", nil, 0, err
	}
	if info.IsDir() {
		return "", nil, 0, fmt.Errorf("%q is a directory", path)
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return "", nil, 0, err
	}

	content := string(data)
	allLines := internal.SplitLines(content)
	totalLines := len(allLines)

	start := offset
	if start < 0 {
		start = 0
	}
	if start > totalLines {
		start = totalLines
	}
	end := start + lines
	if end > totalLines {
		end = totalLines
	}
	if lines == 0 {
		end = totalLines
	}

	return content, allLines[start:end], totalLines, nil
}

func renderReadJSON(path string, info os.FileInfo, content string, displayLines []string, totalLines int, offset, lines int) error {
	displayContent := content
	if offset > 0 || lines > 0 {
		displayContent = internal.JoinLines(displayLines)
	}
	out, err := json.MarshalIndent(map[string]interface{}{
		"file":       path,
		"size":       info.Size(),
		"mode":       info.Mode().String(),
		"mime":       internal.DetectMIME(path),
		"totalLines": totalLines,
		"content":    displayContent,
	}, "", "  ")
	if err != nil {
		return err
	}
	fmt.Println(string(out))
	return nil
}

func renderReadText(path string, displayLines []string, start, totalLines int, showLineNumbers bool) {
	abs, _ := filepath.Abs(path)
	fmt.Printf("── %s ──\n", abs)

	if len(displayLines) == 0 {
		fmt.Println("(empty file)")
		return
	}

	end := start + len(displayLines)
	lineWidth := len(fmt.Sprintf("%d", end))
	for i, line := range displayLines {
		num := start + i + 1
		if showLineNumbers {
			fmt.Printf("%*d | %s\n", lineWidth, num, line)
		} else {
			fmt.Println(line)
		}
	}

	if start > 0 || end < totalLines {
		fmt.Printf("── %d/%d lines (%d-%d) ──\n", end-start, totalLines, start+1, end)
	}
}
