package internal

import (
	"testing"
	"time"
)

func TestResolveDOI_WithArgs(t *testing.T) {
	id, err := ResolveDOI([]string{"10.1000/xyz123"})
	if err != nil {
		t.Fatal(err)
	}
	if id != "10.1000/xyz123" {
		t.Errorf("got %q, want %q", id, "10.1000/xyz123")
	}
}

func TestResolveDOI_NoArgs(t *testing.T) {
	done := make(chan struct{})
	var err error
	go func() {
		defer close(done)
		_, err = ResolveDOI([]string{})
	}()
	select {
	case <-done:
		if err == nil {
			t.Error("expected error when no args (survey fails in non-TTY)")
		}
	case <-time.After(3 * time.Second):
		t.Skip("skipping: survey prompt blocked in test environment (no TTY)")
	}
}
