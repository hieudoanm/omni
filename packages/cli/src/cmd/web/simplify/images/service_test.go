package images

import (
	"encoding/json"
	"io"
	"os"
	"reflect"
	"strings"
	"testing"
)

func Test_parseSrcset(t *testing.T) {
	tests := []struct {
		name string
		src  string
		want []string
	}{
		{"single", "image.jpg 1x", []string{"image.jpg"}},
		{"multiple", "image.jpg 1x, image@2x.jpg 2x", []string{"image.jpg", "image@2x.jpg"}},
		{"with descriptor", "photo.png 640w, photo-lg.png 1280w", []string{"photo.png", "photo-lg.png"}},
		{"empty", "", nil},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseSrcset(tt.src)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseSrcset(%q) = %v, want %v", tt.src, got, tt.want)
			}
		})
	}
}

func Test_resolveURL(t *testing.T) {
	tests := []struct {
		href string
		base string
		want string
	}{
		{"https://example.com/img.jpg", "https://example.com", "https://example.com/img.jpg"},
		{"/img.jpg", "https://example.com", "https://example.com/img.jpg"},
		{"//cdn.example.com/img.jpg", "https://example.com", "https://cdn.example.com/img.jpg"},
		{"img.jpg", "https://example.com/page/", "https://example.com/page/img.jpg"},
		{"", "https://example.com", ""},
	}
	for _, tt := range tests {
		t.Run(tt.href, func(t *testing.T) {
			got := resolveURL(tt.href, tt.base)
			if got != tt.want {
				t.Errorf("resolveURL(%q, %q) = %q, want %q", tt.href, tt.base, got, tt.want)
			}
		})
	}
}

func Test_extFromURL(t *testing.T) {
	tests := []struct {
		rawURL string
		want   string
	}{
		{"https://example.com/image.jpg", ".jpg"},
		{"https://example.com/photo.png", ".png"},
		{"https://example.com/image", ""},
		{"not-a-url", ""},
		{"%%%", ""},
	}
	for _, tt := range tests {
		t.Run(tt.rawURL, func(t *testing.T) {
			got := extFromURL(tt.rawURL)
			if got != tt.want {
				t.Errorf("extFromURL(%q) = %q, want %q", tt.rawURL, got, tt.want)
			}
		})
	}
}

func Test_slugFromURL(t *testing.T) {
	tests := []struct {
		rawURL string
		want   string
	}{
		{"https://example.com/gallery", "example.com-gallery"},
		{"https://www.example.com/photos/nature", "example.com-photos-nature"},
		{"https://example.com", "example.com"},
	}
	for _, tt := range tests {
		t.Run(tt.rawURL, func(t *testing.T) {
			got := slugFromURL(tt.rawURL)
			if got != tt.want {
				t.Errorf("slugFromURL(%q) = %q, want %q", tt.rawURL, got, tt.want)
			}
		})
	}
}

func Test_extractImageURLs(t *testing.T) {
	tests := []struct {
		name    string
		html    string
		baseURL string
		want    []string
	}{
		{
			name: "og_image",
			html: `<meta property="og:image" content="https://example.com/og.jpg">`,
			want: []string{"https://example.com/og.jpg"},
		},
		{
			name: "twitter_image",
			html: `<meta name="twitter:image" content="https://example.com/tw.jpg">`,
			want: []string{"https://example.com/tw.jpg"},
		},
		{
			name:    "img_src",
			html:    `<img src="/photo.jpg">`,
			baseURL: "https://example.com",
			want:    []string{"https://example.com/photo.jpg"},
		},
		{
			name:    "data_src",
			html:    `<img data-src="/lazy.jpg">`,
			baseURL: "https://example.com",
			want:    []string{"https://example.com/lazy.jpg"},
		},
		{
			name:    "srcset",
			html:    `<img srcset="/small.jpg 640w, /large.jpg 1280w">`,
			baseURL: "https://example.com",
			want:    []string{"https://example.com/small.jpg", "https://example.com/large.jpg"},
		},
		{
			name:    "multiple_sources",
			html:    `<meta property="og:image" content="https://example.com/og.jpg"><img src="/img1.jpg"><img src="/img2.jpg">`,
			baseURL: "https://example.com",
			want:    []string{"https://example.com/og.jpg", "https://example.com/img1.jpg", "https://example.com/img2.jpg"},
		},
		{
			name:    "no_images",
			html:    `<html><body><p>no images here</p></body></html>`,
			baseURL: "https://example.com",
			want:    nil,
		},
		{
			name:    "dedup",
			html:    `<meta property="og:image" content="https://example.com/img.jpg"><img src="https://example.com/img.jpg">`,
			baseURL: "https://example.com",
			want:    []string{"https://example.com/img.jpg"},
		},
		{
			name:    "relative_path",
			html:    `<img src="photo.jpg">`,
			baseURL: "https://example.com/page/",
			want:    []string{"https://example.com/page/photo.jpg"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			base := tt.baseURL
			if base == "" {
				base = "https://example.com"
			}
			got := extractImageURLs(tt.html, base)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("extractImageURLs() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_outputImagesJSON(t *testing.T) {
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := outputImagesJSON(
		[]string{"https://example.com/img1.jpg", "https://example.com/img2.jpg"},
		"https://example.com",
	)
	if err != nil {
		t.Fatal(err)
	}

	w.Close()
	var buf strings.Builder
	io.Copy(&buf, r)
	os.Stdout = old

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(buf.String()), &result); err != nil {
		t.Fatal(err)
	}
	if result["count"] != float64(2) {
		t.Errorf("expected count 2, got %v", result["count"])
	}
	if result["source_url"] != "https://example.com" {
		t.Errorf("expected source_url 'https://example.com', got %v", result["source_url"])
	}
	urls, ok := result["image_urls"].([]interface{})
	if !ok || len(urls) != 2 {
		t.Errorf("expected 2 image_urls, got %v", result["image_urls"])
	}
}
