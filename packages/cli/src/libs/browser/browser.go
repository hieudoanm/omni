package browser

import (
	"fmt"
	"io"
	"math"
	"os"
	"path/filepath"
	"time"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/rod/lib/proto"
)

var systemChromePaths = []string{
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	"/Applications/Chromium.app/Contents/MacOS/Chromium",
	"/usr/bin/google-chrome",
	"/usr/bin/google-chrome-stable",
	"/usr/bin/chromium",
	"/usr/bin/chromium-browser",
}

var userHomeDir = os.UserHomeDir

// Options configures a screenshot capture.
type Options struct {
	Width    int
	Height   int
	FullPage bool
	Delay    time.Duration
	Quality  int  // 0–100, PNG ignores this (always lossless)
	PDF      bool // capture as PDF instead of PNG
}

// DefaultOptions returns sensible defaults.
func DefaultOptions() Options {
	return Options{
		Width:   1440,
		Height:  900,
		Quality: 90,
	}
}

// chromePath resolves the Chrome/Chromium executable to use.
// Priority: CHROME_PATH env → system paths → puppeteer local cache → rod auto-download.
func chromePath() string {
	// 1. Explicit override
	if p := os.Getenv("CHROME_PATH"); p != "" {
		return p
	}

	// 2. System-installed paths (most stable)
	for _, p := range systemChromePaths {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}

	home, _ := userHomeDir()

	// 3. Puppeteer cache — covers `npx @puppeteer/browsers install chrome@stable`
	puppeteerGlobs := []string{
		filepath.Join(home, ".cache/puppeteer/chrome/mac_arm-*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
		filepath.Join(home, ".cache/puppeteer/chrome/mac-*/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
		filepath.Join(home, ".cache/puppeteer/chrome/linux-*/chrome-linux64/chrome"),
		"./chrome/mac_arm-*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
		"./chrome/linux-*/chrome-linux64/chrome",
	}
	for _, pattern := range puppeteerGlobs {
		matches, err := filepath.Glob(pattern)
		if err == nil && len(matches) > 0 {
			return matches[len(matches)-1]
		}
	}

	return "" // let rod auto-download its own pinned Chromium
}

// FetchHTML navigates to a URL, waits for the page to load, waits an
// additional delay (for JS-lazy content), and returns the rendered HTML.
func FetchHTML(url string, delay time.Duration) (string, error) {
	l := launcher.New().
		Headless(true).
		Set("no-sandbox", "").
		Set("disable-gpu", "").
		Set("disable-dev-shm-usage", "")

	if p := chromePath(); p != "" {
		l = l.Bin(p)
	}

	controlURL, err := l.Launch()
	if err != nil {
		return "", fmt.Errorf("launching browser: %w", err)
	}

	browser := rod.New().ControlURL(controlURL).MustConnect()
	defer browser.MustClose()

	page, err := browser.Page(proto.TargetCreateTarget{URL: "about:blank"})
	if err != nil {
		return "", fmt.Errorf("creating page: %w", err)
	}
	defer page.MustClose()

	if err := page.Navigate(url); err != nil {
		return "", fmt.Errorf("navigating to %s: %w", url, err)
	}
	if err := page.WaitLoad(); err != nil {
		return "", fmt.Errorf("waiting for load: %w", err)
	}

	if delay > 0 {
		time.Sleep(delay)
	}

	return page.HTML()
}

// Capture takes a screenshot of url and returns raw bytes (PNG or PDF).
func Capture(url string, opts Options) ([]byte, error) {
	l := launcher.New().
		Headless(true).
		Set("no-sandbox", "").
		Set("disable-gpu", "").
		Set("disable-dev-shm-usage", "")

	if p := chromePath(); p != "" {
		l = l.Bin(p)
	}
	// If no binary found, rod auto-downloads a pinned Chromium build on first run.

	controlURL, err := l.Launch()
	if err != nil {
		return nil, fmt.Errorf("launching browser: %w", err)
	}

	browser := rod.New().ControlURL(controlURL).MustConnect()
	defer browser.MustClose()

	page, err := browser.Page(proto.TargetCreateTarget{URL: "about:blank"})
	if err != nil {
		return nil, fmt.Errorf("creating page: %w", err)
	}
	defer page.MustClose()

	// Set viewport dimensions
	if err := page.SetViewport(&proto.EmulationSetDeviceMetricsOverride{
		Width:             opts.Width,
		Height:            opts.Height,
		DeviceScaleFactor: 1,
		Mobile:            false,
	}); err != nil {
		return nil, fmt.Errorf("setting viewport: %w", err)
	}

	// Navigate and wait for page load
	if err := page.Navigate(url); err != nil {
		return nil, fmt.Errorf("navigating to %s: %w", url, err)
	}
	if err := page.WaitLoad(); err != nil {
		return nil, fmt.Errorf("waiting for load: %w", err)
	}

	// Optional delay for JS-heavy / lazy-loaded pages
	if opts.Delay > 0 {
		time.Sleep(opts.Delay)
	}

	if opts.PDF {
		return capturePDF(page)
	}

	return page.Screenshot(opts.FullPage, &proto.PageCaptureScreenshot{
		Format:  proto.PageCaptureScreenshotFormatPng,
		Quality: &opts.Quality,
	})
}

// capturePDF prints the page to PDF with print-media CSS applied.
func capturePDF(page *rod.Page) ([]byte, error) {
	if err := (proto.EmulationSetEmulatedMedia{
		Media: "print",
	}).Call(page); err != nil {
		return nil, fmt.Errorf("emulating print media: %w", err)
	}

	stream, err := page.PDF(&proto.PagePrintToPDF{
		PrintBackground:   true,
		PreferCSSPageSize: true,
	})
	if err != nil {
		return nil, fmt.Errorf("printing to PDF: %w", err)
	}
	defer stream.Close()

	buf, err := io.ReadAll(stream)
	if err != nil {
		return nil, fmt.Errorf("reading PDF stream: %w", err)
	}

	return buf, nil
}

// PageInfo holds metadata scraped alongside the screenshot.
type PageInfo struct {
	Title string
	URL   string
}

// GetPageInfo returns the page title and final URL after navigation.
func GetPageInfo(page *rod.Page) (PageInfo, error) {
	res, err := page.Evaluate(&rod.EvalOptions{
		JS: `() => document.title`,
	})
	if err != nil {
		return PageInfo{}, fmt.Errorf("getting title: %w", err)
	}

	title := res.Value.String()

	info, err := page.Info()
	if err != nil {
		return PageInfo{}, fmt.Errorf("getting page info: %w", err)
	}

	return PageInfo{
		Title: title,
		URL:   info.URL,
	}, nil
}

// ViewportPreset maps named presets to dimensions.
type ViewportPreset struct {
	Width  int
	Height int
}

var Presets = map[string]ViewportPreset{
	"desktop": {1440, 900},
	"laptop":  {1280, 800},
	"tablet":  {768, 1024},
	"mobile":  {390, 844},
	"4k":      {3840, 2160},
	"hd":      {1920, 1080},
}

// NearestPreset finds the preset name closest to given dimensions.
func NearestPreset(w, h int) string {
	var best string
	bestDist := math.MaxFloat64
	for name, p := range Presets {
		d := math.Sqrt(math.Pow(float64(p.Width-w), 2) + math.Pow(float64(p.Height-h), 2))
		if d < bestDist {
			bestDist = d
			best = name
		}
	}
	return best
}
