package write

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/internal"
)

func getWriteContent(content string) (string, error) {
	if content != "" {
		return content, nil
	}
	data, err := readStdin()
	if err != nil {
		return "", fmt.Errorf("stdin: %w", err)
	}
	return string(data), nil
}

func openFileForWrite(path string, appendMode, mkdir bool, permMode string) (int, os.FileMode, error) {
	if mkdir {
		dir := filepath.Dir(path)
		if dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return 0, 0, fmt.Errorf("mkdir: %w", err)
			}
		}
	}

	mode := os.FileMode(0644)
	if permMode != "" {
		m, err := internal.ParseMode(permMode)
		if err != nil {
			return 0, 0, err
		}
		mode = m
	}

	flag := os.O_CREATE | os.O_WRONLY
	if appendMode {
		flag |= os.O_APPEND
	} else {
		flag |= os.O_TRUNC
	}
	return flag, mode, nil
}

func outputWriteResult(path string, n int, appendMode bool, jsonOutput bool) error {
	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"file":   path,
			"bytes":  n,
			"append": appendMode,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	verb := "Written"
	if appendMode {
		verb = "Appended"
	}
	fmt.Printf("%s %d bytes to %s\n", verb, n, path)
	return nil
}

func readStdin() ([]byte, error) {
	stat, err := os.Stdin.Stat()
	if err != nil {
		return nil, err
	}
	if (stat.Mode() & os.ModeCharDevice) != 0 {
		return nil, fmt.Errorf("no content provided (pipe content or pass as argument)")
	}
	data := make([]byte, 0, 4096)
	buf := make([]byte, 1024)
	for {
		n, err := os.Stdin.Read(buf)
		if n > 0 {
			data = append(data, buf[:n]...)
		}
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return nil, err
		}
	}
	if len(data) > 0 && data[len(data)-1] == '\n' {
		data = data[:len(data)-1]
	}
	return data, nil
}

func isStdinPiped() bool {
	stat, _ := os.Stdin.Stat()
	return (stat.Mode() & os.ModeCharDevice) == 0
}
