package browser

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/rod/lib/proto"
)

func TestDefaultOptions(t *testing.T) {
	opts := DefaultOptions()
	if opts.Width != 1440 || opts.Height != 900 || opts.Quality != 90 {
		t.Errorf("DefaultOptions() = %+v", opts)
	}
}

func TestNearestPreset(t *testing.T) {
	tests := []struct {
		w, h int
		want string
	}{
		{1440, 900, "desktop"},
		{1280, 800, "laptop"},
		{768, 1024, "tablet"},
		{390, 844, "mobile"},
		{3840, 2160, "4k"},
		{1920, 1080, "hd"},
		{2000, 1100, "hd"},
		{400, 800, "mobile"},
		{100, 100, "mobile"},
		{9999, 9999, "4k"},
	}
	for _, tt := range tests {
		got := NearestPreset(tt.w, tt.h)
		if got != tt.want {
			t.Errorf("NearestPreset(%d, %d) = %q, want %q", tt.w, tt.h, got, tt.want)
		}
	}
}

func TestChromePathEnvVar(t *testing.T) {
	t.Setenv("CHROME_PATH", "/custom/chrome")
	if got := chromePath(); got != "/custom/chrome" {
		t.Errorf("chromePath() = %q, want %q", got, "/custom/chrome")
	}
}

func TestChromePathSystemPaths(t *testing.T) {
	t.Setenv("CHROME_PATH", "")
	got := chromePath()
	if got == "" {
		t.Log("no Chrome found at system paths")
		return
	}
	if _, err := os.Stat(got); err != nil {
		t.Errorf("chromePath() = %q, stat: %v", got, err)
	}
}

func TestChromePathPuppeteerGlob(t *testing.T) {
	origSystemPaths := systemChromePaths
	origHomeFunc := userHomeDir
	t.Cleanup(func() {
		systemChromePaths = origSystemPaths
		userHomeDir = origHomeFunc
	})

	systemChromePaths = nil

	tmpHome := t.TempDir()
	userHomeDir = func() (string, error) { return tmpHome, nil }

	chromeDir := filepath.Join(tmpHome, ".cache/puppeteer/chrome/mac_arm-test/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS")
	if err := os.MkdirAll(chromeDir, 0755); err != nil {
		t.Fatal(err)
	}
	chromeExe := filepath.Join(chromeDir, "Google Chrome for Testing")
	if err := os.WriteFile(chromeExe, []byte("x"), 0644); err != nil {
		t.Fatal(err)
	}

	t.Setenv("CHROME_PATH", "")
	got := chromePath()
	if got == "" {
		t.Error("chromePath() should find puppeteer Chrome")
	}
}

func TestChromePathFallback(t *testing.T) {
	origSystemPaths := systemChromePaths
	origHomeFunc := userHomeDir
	t.Cleanup(func() {
		systemChromePaths = origSystemPaths
		userHomeDir = origHomeFunc
	})

	systemChromePaths = nil

	tmpHome := t.TempDir()
	userHomeDir = func() (string, error) { return tmpHome, nil }

	t.Setenv("CHROME_PATH", "")
	if got := chromePath(); got != "" {
		t.Errorf("chromePath() = %q, want empty string", got)
	}
}

func TestPresetsMap(t *testing.T) {
	expected := map[string]ViewportPreset{
		"desktop": {1440, 900},
		"laptop":  {1280, 800},
		"tablet":  {768, 1024},
		"mobile":  {390, 844},
		"4k":      {3840, 2160},
		"hd":      {1920, 1080},
	}
	if len(Presets) != len(expected) {
		t.Errorf("Presets length = %d, want %d", len(Presets), len(expected))
	}
	for name, want := range expected {
		got, ok := Presets[name]
		if !ok {
			t.Errorf("Presets missing key %q", name)
			continue
		}
		if got != want {
			t.Errorf("Presets[%q] = %+v, want %+v", name, got, want)
		}
	}
}

func TestOptionsZeroValue(t *testing.T) {
	var o Options
	if o.Width != 0 || o.Height != 0 || o.FullPage || o.Delay != 0 || o.Quality != 0 || o.PDF {
		t.Errorf("Options zero value unexpected: %+v", o)
	}
}

func TestPageInfoZeroValue(t *testing.T) {
	var info PageInfo
	if info.Title != "" || info.URL != "" {
		t.Errorf("PageInfo zero value = %+v, want empty", info)
	}
}

func TestViewportPresetZeroValue(t *testing.T) {
	var vp ViewportPreset
	if vp.Width != 0 || vp.Height != 0 {
		t.Errorf("ViewportPreset zero value = %+v, want {0,0}", vp)
	}
}

func TestFetchHTML(t *testing.T) {
	html, err := FetchHTML("data:text/html,<h1>Hello</h1>", 0)
	if err != nil {
		t.Fatalf("FetchHTML() error: %v", err)
	}
	if !strings.Contains(html, "Hello") {
		t.Errorf("FetchHTML() = %q, want content containing 'Hello'", html)
	}
}

func TestCapturePNG(t *testing.T) {
	data, err := Capture("data:text/html,<h1>Hello</h1>", DefaultOptions())
	if err != nil {
		t.Fatalf("Capture(PNG) error: %v", err)
	}
	if len(data) == 0 {
		t.Error("Capture(PNG) returned empty data")
	}
}

func TestCapturePDF(t *testing.T) {
	opts := DefaultOptions()
	opts.PDF = true
	data, err := Capture("data:text/html,<h1>Hello</h1>", opts)
	if err != nil {
		t.Fatalf("Capture(PDF) error: %v", err)
	}
	if len(data) == 0 {
		t.Error("Capture(PDF) returned empty data")
	}
	if !strings.HasPrefix(string(data), "%PDF") {
		t.Errorf("Capture(PDF) data starts with %q, want '%%PDF'", string(data[:5]))
	}
}

func TestCaptureFullPage(t *testing.T) {
	opts := DefaultOptions()
	opts.FullPage = true
	data, err := Capture("data:text/html,<h1>Hello</h1>", opts)
	if err != nil {
		t.Fatalf("Capture(fullpage) error: %v", err)
	}
	if len(data) == 0 {
		t.Error("Capture(fullpage) returned empty data")
	}
}

func TestCaptureWithDelay(t *testing.T) {
	opts := DefaultOptions()
	opts.Delay = 50 * time.Millisecond
	data, err := Capture("data:text/html,<h1>Hello</h1>", opts)
	if err != nil {
		t.Fatalf("Capture(delay) error: %v", err)
	}
	if len(data) == 0 {
		t.Error("Capture(delay) returned empty data")
	}
}

func TestFetchHTMLWithDelay(t *testing.T) {
	html, err := FetchHTML("data:text/html,<p>World</p>", 50*time.Millisecond)
	if err != nil {
		t.Fatalf("FetchHTML(delay) error: %v", err)
	}
	if !strings.Contains(html, "World") {
		t.Errorf("FetchHTML(delay) = %q, want content containing 'World'", html)
	}
}

func TestFetchHTML_LaunchError(t *testing.T) {
	t.Setenv("CHROME_PATH", "/nonexistent/chrome-binary")
	_, err := FetchHTML("about:blank", 0)
	if err == nil {
		t.Error("FetchHTML() expected error with invalid CHROME_PATH")
	}
}

func TestCapture_LaunchError(t *testing.T) {
	t.Setenv("CHROME_PATH", "/nonexistent/chrome-binary")
	_, err := Capture("about:blank", DefaultOptions())
	if err == nil {
		t.Error("Capture() expected error with invalid CHROME_PATH")
	}
}

func TestGetPageInfo(t *testing.T) {
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
		t.Fatalf("launching browser: %v", err)
	}
	browser := rod.New().ControlURL(controlURL).MustConnect()
	defer browser.MustClose()
	page, err := browser.Page(proto.TargetCreateTarget{URL: "about:blank"})
	if err != nil {
		t.Fatalf("creating page: %v", err)
	}
	defer page.MustClose()
	if err := page.Navigate("data:text/html,<title>TestTitle</title><h1>Hello</h1>"); err != nil {
		t.Fatalf("navigating: %v", err)
	}
	if err := page.WaitLoad(); err != nil {
		t.Fatalf("waiting for load: %v", err)
	}
	info, err := GetPageInfo(page)
	if err != nil {
		t.Fatalf("GetPageInfo() error: %v", err)
	}
	if info.Title != "TestTitle" {
		t.Errorf("GetPageInfo().Title = %q, want %q", info.Title, "TestTitle")
	}
	if info.URL == "" {
		t.Error("GetPageInfo().URL is empty")
	}
}

func TestCapturePDF_Error(t *testing.T) {
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
		t.Fatalf("launching browser: %v", err)
	}
	browser := rod.New().ControlURL(controlURL).MustConnect()
	defer browser.MustClose()
	page, err := browser.Page(proto.TargetCreateTarget{URL: "about:blank"})
	if err != nil {
		t.Fatalf("creating page: %v", err)
	}

	if err := page.Navigate("data:text/html,<h1>Hello</h1>"); err != nil {
		t.Fatalf("navigating: %v", err)
	}
	if err := page.WaitLoad(); err != nil {
		t.Fatalf("waiting for load: %v", err)
	}

	page.MustClose()

	_, err = capturePDF(page)
	if err == nil {
		t.Error("capturePDF() expected error with closed page")
	}
}

func TestGetPageInfo_EvaluateError(t *testing.T) {
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
		t.Fatalf("launching browser: %v", err)
	}
	browser := rod.New().ControlURL(controlURL).MustConnect()
	defer browser.MustClose()
	page, err := browser.Page(proto.TargetCreateTarget{URL: "about:blank"})
	if err != nil {
		t.Fatalf("creating page: %v", err)
	}
	page.MustClose()
	_, err = GetPageInfo(page)
	if err == nil {
		t.Error("GetPageInfo() expected error after page closed")
	}
}
