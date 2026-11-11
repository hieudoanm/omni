package internal

import (
	"testing"
)

func TestExtractVideoID(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		{"full URL", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ", false},
		{"youtu.be short", "https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ", false},
		{"embed URL", "https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ", false},
		{"shorts URL", "https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ", false},
		{"raw 11-char ID", "dQw4w9WgXcQ", "dQw4w9WgXcQ", false},
		{"raw ID with whitespace", "  dQw4w9WgXcQ  ", "dQw4w9WgXcQ", false},
		{"invalid too short", "abc", "", true},
		{"invalid empty", "", "", true},
		{"invalid random string", "not-a-video-id-here", "", true},
		{"full URL with extra params", "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=123", "dQw4w9WgXcQ", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ExtractVideoID(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("ExtractVideoID() error = %v, wantErr = %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ExtractVideoID() = %q, want %q", got, tt.want)
			}
		})
	}
}
