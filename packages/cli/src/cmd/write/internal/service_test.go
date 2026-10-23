package internal

import (
	"os"
	"testing"
)

func TestCallLLM_NoAPIKey(t *testing.T) {
	os.Unsetenv("OPENROUTER_API_KEY")
	_, err := CallLLM("system prompt", "user text")
	if err == nil {
		t.Fatal("expected error when OPENROUTER_API_KEY is not set")
	}
}
