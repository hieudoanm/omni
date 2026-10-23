package snapshot

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func Test_hostnameSlug(t *testing.T) {
	tests := []struct {
		name string
		url  string
		want string
	}{
		{"simple host", "https://example.com", "example_com"},
		{"www subdomain", "https://www.example.com", "www_example_com"},
		{"path ignored", "https://example.com/path/to/page", "example_com"},
		{"query ignored", "https://example.com/page?q=1", "example_com"},
		{"port number", "https://example.com:8080", "example_com_8080"},
		{"no scheme", "example.com", "snapshot"},
		{"invalid URL", "://invalid", "snapshot"},
		{"empty string", "", "snapshot"},
		{"multiple subdomains", "https://deep.sub.domain.example.com", "deep_sub_domain_example_com"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := hostnameSlug(tt.url)
			if got != tt.want {
				t.Errorf("hostnameSlug(%q) = %q, want %q", tt.url, got, tt.want)
			}
		})
	}
}

func Test_resolveOutput_existingDir(t *testing.T) {
	dir := t.TempDir()
	path, err := resolveOutput(dir, "https://example.com", false)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(path, ".png") {
		t.Errorf("expected .png extension, got %s", path)
	}
	if !strings.Contains(path, "example_com") {
		t.Errorf("expected example_com in path, got %s", path)
	}
}

func Test_resolveOutput_trailingSlash(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "newsub")
	path, err := resolveOutput(dir+string(os.PathSeparator), "https://example.com", true)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(path, ".pdf") {
		t.Errorf("expected .pdf extension, got %s", path)
	}
	if !strings.Contains(path, "example_com") {
		t.Errorf("expected example_com in path, got %s", path)
	}
	if _, statErr := os.Stat(dir); os.IsNotExist(statErr) {
		t.Error("expected directory to be created")
	}
}

func Test_resolveOutput_filePath(t *testing.T) {
	dir := t.TempDir()
	filePath := filepath.Join(dir, "output.png")
	path, err := resolveOutput(filePath, "https://example.com", false)
	if err != nil {
		t.Fatal(err)
	}
	if path != filePath {
		t.Errorf("expected %s, got %s", filePath, path)
	}
}

func Test_defaultSnapshotPath(t *testing.T) {
	path, err := defaultSnapshotPath("https://example.com", false)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(path, ".snapshot") {
		t.Errorf("expected .snapshot dir in path, got %s", path)
	}
	if !strings.HasSuffix(path, ".png") {
		t.Errorf("expected .png extension, got %s", path)
	}
	if !strings.Contains(path, "example_com") {
		t.Errorf("expected example_com in path, got %s", path)
	}
}

func Test_defaultSnapshotPath_pdf(t *testing.T) {
	path, err := defaultSnapshotPath("https://example.com/article", true)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(path, ".pdf") {
		t.Errorf("expected .pdf extension, got %s", path)
	}
}

func Test_parseDuration(t *testing.T) {
	tests := []struct {
		input   string
		wantErr bool
	}{
		{"500ms", false},
		{"2s", false},
		{"1m", false},
		{"invalid", true},
		{"", true},
	}
	for _, tt := range tests {
		_, err := parseDuration(tt.input)
		if (err != nil) != tt.wantErr {
			t.Errorf("parseDuration(%q) error = %v, wantErr = %v", tt.input, err, tt.wantErr)
		}
	}
}
