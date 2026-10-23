package images

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/libs/browser"
	"github.com/hieudoanm/omni/packages/cli/src/libs/colors"
)

var ogImagePattern = regexp.MustCompile(`<meta[^>]+property="og:image"[^>]+content="([^"]+)"`)
var twitterImagePattern = regexp.MustCompile(`<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"`)
var imgSrcPattern = regexp.MustCompile(`<img[^>]+src="([^"]+)"`)
var imgSrcsetPattern = regexp.MustCompile(`<img[^>]+srcset="([^"]+)"`)
var dataSrcPattern = regexp.MustCompile(`<img[^>]+data-src="([^"]+)"`)

func fetchPageHTML(pageURL string, wait time.Duration) (string, error) {
	html, err := browser.FetchHTML(pageURL, wait)
	if err != nil {
		return "", fmt.Errorf("fetch page: %w", err)
	}
	return html, nil
}

func extractImageURLs(html, baseURL string) []string {
	seen := map[string]bool{}
	var urls []string

	add := func(raw string) {
		abs := resolveURL(raw, baseURL)
		if abs != "" && !seen[abs] {
			seen[abs] = true
			urls = append(urls, abs)
		}
	}

	for _, m := range ogImagePattern.FindAllStringSubmatch(html, -1) {
		add(m[1])
	}
	for _, m := range twitterImagePattern.FindAllStringSubmatch(html, -1) {
		add(m[1])
	}
	for _, m := range dataSrcPattern.FindAllStringSubmatch(html, -1) {
		add(m[1])
	}
	for _, m := range imgSrcsetPattern.FindAllStringSubmatch(html, -1) {
		for _, candidate := range parseSrcset(m[1]) {
			add(candidate)
		}
	}
	for _, m := range imgSrcPattern.FindAllStringSubmatch(html, -1) {
		add(m[1])
	}

	return urls
}

func parseSrcset(raw string) []string {
	var urls []string
	for _, part := range strings.Split(raw, ",") {
		part = strings.TrimSpace(part)
		if idx := strings.LastIndex(part, " "); idx > 0 {
			part = part[:idx]
		}
		part = strings.TrimSpace(part)
		if part != "" {
			urls = append(urls, part)
		}
	}
	return urls
}

func resolveURL(href, base string) string {
	if href == "" {
		return ""
	}
	href = strings.TrimSpace(href)
	href = strings.ReplaceAll(href, "&amp;", "&")

	if strings.HasPrefix(href, "http://") || strings.HasPrefix(href, "https://") {
		return href
	}

	baseURL, err := url.Parse(base)
	if err != nil {
		return href
	}

	if strings.HasPrefix(href, "//") {
		return baseURL.Scheme + ":" + href
	}

	if strings.HasPrefix(href, "/") {
		return baseURL.Scheme + "://" + baseURL.Host + href
	}

	baseDir := path.Dir(baseURL.Path)
	if baseDir == "." {
		baseDir = ""
	}
	return baseURL.Scheme + "://" + baseURL.Host + baseDir + "/" + href
}

func extFromURL(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil {
		return ""
	}
	return filepath.Ext(path.Base(u.Path))
}

func downloadImageFile(rawURL, filename, outDir string) (string, error) {
	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Get(rawURL)
	if err != nil {
		return "", fmt.Errorf("download: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read: %w", err)
	}

	ext := extFromURL(rawURL)
	if ext == "" {
		ct := resp.Header.Get("Content-Type")
		switch {
		case strings.Contains(ct, "image/jpeg"):
			ext = ".jpg"
		case strings.Contains(ct, "image/png"):
			ext = ".png"
		case strings.Contains(ct, "image/webp"):
			ext = ".webp"
		case strings.Contains(ct, "image/gif"):
			ext = ".gif"
		case strings.Contains(ct, "image/svg"):
			ext = ".svg"
		case strings.Contains(ct, "image/avif"):
			ext = ".avif"
		}
	}

	savePath := filepath.Join(outDir, filename+ext)
	if err := os.WriteFile(savePath, body, 0644); err != nil {
		return "", fmt.Errorf("write: %w", err)
	}
	return savePath, nil
}

func slugFromURL(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil {
		return "page"
	}
	host := strings.TrimPrefix(u.Hostname(), "www.")
	segments := strings.Split(strings.Trim(u.Path, "/"), "/")
	last := strings.Builder{}
	for _, s := range segments {
		if s != "" {
			if last.Len() > 0 {
				last.WriteString("-")
			}
			last.WriteString(s)
		}
	}
	if last.Len() == 0 {
		return host
	}
	return host + "-" + last.String()
}

func outputImagesJSON(imageURLs []string, sourceURL string) error {
	out, err := json.MarshalIndent(map[string]interface{}{
		"source_url": sourceURL,
		"image_urls": imageURLs,
		"count":      len(imageURLs),
	}, "", "  ")
	if err != nil {
		return err
	}
	fmt.Println(string(out))
	return nil
}

func saveImages(imageURLs []string, sourceURL string, imgIndex int, outputDir string) int {
	prefix := slugFromURL(sourceURL)
	var downloaded int
	for i, u := range imageURLs {
		filename := fmt.Sprintf("%s_%d", prefix, i+1)
		if len(imageURLs) == 1 && imgIndex > 0 {
			filename = fmt.Sprintf("%s_%d", prefix, imgIndex)
		} else if len(imageURLs) == 1 {
			filename = prefix
		}

		path, err := downloadImageFile(u, filename, outputDir)
		if err != nil {
			fmt.Printf(colors.Red("failed: %v\n"), err)
			continue
		}
		fmt.Println(colors.Green("saved ") + path)
		downloaded++
	}
	return downloaded
}
