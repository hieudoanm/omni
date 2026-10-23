package snapshot

import (
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/libs/browser"
)

type result struct {
	URL      string `json:"url"`
	File     string `json:"file"`
	SizeKB   int    `json:"size_kb"`
	TimeSec  string `json:"time_sec"`
	Format   string `json:"format"`
	Viewport string `json:"viewport"`
	FullPage bool   `json:"full_page"`
}

func parseDuration(s string) (time.Duration, error) {
	d, err := time.ParseDuration(s)
	if err != nil {
		return 0, fmt.Errorf("invalid delay %q: use format like 500ms, 2s, 1m", s)
	}
	return d, nil
}

func snapshotRun(rawURL, output string, opts browser.Options, verbose bool) (result, error) {
	if !strings.HasPrefix(rawURL, "http://") && !strings.HasPrefix(rawURL, "https://") {
		rawURL = "https://" + rawURL
	}

	var outPath string
	var err error

	if output == "" {
		outPath, err = defaultSnapshotPath(rawURL, opts.PDF)
	} else {
		outPath, err = resolveOutput(output, rawURL, opts.PDF)
	}
	if err != nil {
		return result{}, err
	}

	start := time.Now()
	data, err := browser.Capture(rawURL, opts)
	if err != nil {
		return result{}, fmt.Errorf("capture failed: %w", err)
	}
	elapsed := time.Since(start)

	if err := os.WriteFile(outPath, data, 0644); err != nil {
		return result{}, fmt.Errorf("writing file: %w", err)
	}

	ext := "PNG"
	if opts.PDF {
		ext = "PDF"
	}

	return result{
		URL:      rawURL,
		File:     outPath,
		SizeKB:   len(data) / 1024,
		TimeSec:  fmt.Sprintf("%.1f", elapsed.Seconds()),
		Format:   ext,
		Viewport: fmt.Sprintf("%dx%d", opts.Width, opts.Height),
		FullPage: opts.FullPage,
	}, nil
}

func outputJSON(r result) error {
	out, err := json.MarshalIndent(r, "", "  ")
	if err != nil {
		return err
	}
	fmt.Println(string(out))
	return nil
}

func outputText(r result, verbose bool) {
	fmt.Printf("Capturing %s\n", r.URL)
	if verbose {
		fmt.Printf("    Viewport : %s\n", r.Viewport)
		fmt.Printf("    Full page: %v\n", r.FullPage)
		fmt.Printf("    Format   : %s\n", r.Format)
	}
	fmt.Printf("Saved -> %s\n", r.File)
	if verbose {
		fmt.Printf("    Size: %d KB | Time: %ss\n", r.SizeKB, r.TimeSec)
	}
}

func resolveOutput(output, rawURL string, pdf bool) (string, error) {
	ext := ".png"
	if pdf {
		ext = ".pdf"
	}

	info, err := os.Stat(output)
	if err == nil && info.IsDir() {
		name := hostnameSlug(rawURL) + "_" + time.Now().Format("20060102_150405") + ext
		return filepath.Join(output, name), nil
	}

	if strings.HasSuffix(output, string(os.PathSeparator)) || strings.HasSuffix(output, "/") {
		if err := os.MkdirAll(output, 0755); err != nil {
			return "", fmt.Errorf("creating directory %s: %w", output, err)
		}
		name := hostnameSlug(rawURL) + "_" + time.Now().Format("20060102_150405") + ext
		return filepath.Join(output, name), nil
	}

	dir := filepath.Dir(output)
	if dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return "", fmt.Errorf("creating directory %s: %w", dir, err)
		}
	}
	return output, nil
}

func hostnameSlug(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil || u.Host == "" {
		return "snapshot"
	}
	slug := strings.ReplaceAll(u.Host, ".", "_")
	slug = strings.ReplaceAll(slug, ":", "_")
	return slug
}

func defaultSnapshotPath(rawURL string, pdf bool) (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("getting home dir: %w", err)
	}
	dir := filepath.Join(home, ".snapshot")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("creating snapshot dir: %w", err)
	}
	ext := ".png"
	if pdf {
		ext = ".pdf"
	}
	filename := hostnameSlug(rawURL) + "_" + time.Now().Format("20060102_150405") + ext
	return filepath.Join(dir, filename), nil
}
