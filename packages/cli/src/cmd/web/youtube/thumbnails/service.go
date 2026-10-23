package thumbnails

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func ytThumbURL(videoID, qualityID string) string {
	return fmt.Sprintf("https://img.youtube.com/vi/%s/%s.jpg", videoID, qualityID)
}

func ytDownloadThumb(videoID, qualityID, outDir string) (string, error) {
	rawURL := ytThumbURL(videoID, qualityID)

	resp, err := http.Get(rawURL)
	if err != nil {
		return "", fmt.Errorf("fetch failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("HTTP %d for quality %s", resp.StatusCode, qualityID)
	}

	if resp.ContentLength > 0 && resp.ContentLength < 1000 {
		return "", fmt.Errorf("quality %s not available (placeholder image)", qualityID)
	}

	filename := fmt.Sprintf("%s-%s.jpg", videoID, qualityID)
	path := filepath.Join(outDir, filename)

	f, err := os.Create(path)
	if err != nil {
		return "", fmt.Errorf("create file: %w", err)
	}
	defer f.Close()

	written, err := io.Copy(f, resp.Body)
	if err != nil {
		return "", fmt.Errorf("write file: %w", err)
	}

	if written < 1000 {
		os.Remove(path)
		return "", fmt.Errorf("quality %s not available (too small: %d bytes)", qualityID, written)
	}

	return path, nil
}

func ytValidQualityIDs() string {
	ids := make([]string, len(ytQualities))
	for i, q := range ytQualities {
		ids[i] = q.id
	}
	return strings.Join(ids, ", ")
}
