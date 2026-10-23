package internal

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

func SplitLines(s string) []string {
	var lines []string
	var start int
	for i := 0; i < len(s); i++ {
		if s[i] == '\n' {
			lines = append(lines, s[start:i])
			start = i + 1
		}
	}
	if start <= len(s) {
		lines = append(lines, s[start:])
	}
	return lines
}

func JoinLines(lines []string) string {
	if len(lines) == 0 {
		return ""
	}
	result := lines[0]
	for _, l := range lines[1:] {
		result += "\n" + l
	}
	return result
}

func FormatSize(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	sizes := []string{"KB", "MB", "GB", "TB"}
	return fmt.Sprintf("%.1f %s", float64(bytes)/float64(div), sizes[exp])
}

func ParseMode(s string) (os.FileMode, error) {
	var mode uint32
	if _, err := fmt.Sscanf(s, "%o", &mode); err != nil {
		return 0, fmt.Errorf("invalid mode %q (use octal e.g. 755)", s)
	}
	return os.FileMode(mode), nil
}

func DetectMIME(path string) string {
	ext := strings.ToLower(filepath.Ext(path))
	mimes := map[string]string{
		".txt": "text/plain", ".md": "text/markdown", ".html": "text/html",
		".css": "text/css", ".js": "text/javascript", ".json": "application/json",
		".xml": "application/xml", ".yml": "application/x-yaml", ".yaml": "application/x-yaml",
		".toml": "application/toml", ".csv": "text/csv",
		".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
		".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp",
		".pdf": "application/pdf", ".doc": "application/msword",
		".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".xls":  "application/vnd.ms-excel", ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		".zip": "application/zip", ".tar": "application/x-tar", ".gz": "application/gzip",
		".mp3": "audio/mpeg", ".mp4": "video/mp4",
		".go": "text/x-go", ".py": "text/x-python", ".rs": "text/x-rust",
		".sh": "text/x-shellscript", ".swift": "text/x-swift",
	}
	if m, ok := mimes[ext]; ok {
		return m
	}
	return "application/octet-stream"
}

func QuickHash(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()
	h := sha256.New()
	io.Copy(h, f)
	return hex.EncodeToString(h.Sum(nil)), nil
}
