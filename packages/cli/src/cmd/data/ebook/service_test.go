package ebook

import (
	"testing"
)

func TestRunE_FileNotFound(t *testing.T) {
	err := runE("/nonexistent/file.epub", "mobi", "")
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}

func TestRunE_FormatValidation(t *testing.T) {
	err := runE("test.epub", "txt", "")
	if err == nil {
		t.Fatal("expected error - ebook-convert handles unsupported formats gracefully")
	}
}
