package openrouterlib

import (
	"testing"
)

func TestExtractMessage(t *testing.T) {
	raw := []byte(`{"error": {"message": "Rate limit exceeded"}}`)
	msg := ExtractMessage(raw)
	if msg != "Rate limit exceeded" {
		t.Errorf("ExtractMessage failed: got %s", msg)
	}

	longMsg := "This is a very long error message that should be truncated by the extractMessage function because it exceeds eighty characters."
	rawLong := []byte(`{"error": {"message": "` + longMsg + `"}}`)
	msgLong := ExtractMessage(rawLong)
	if len(msgLong) > 80 {
		t.Errorf("Truncation failed: length %d", len(msgLong))
	}
}
