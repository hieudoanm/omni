package lorem_test

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/lorem"
)

func TestRun_DefaultParagraphs(t *testing.T) {
	cmd := lorem.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := lorem.Run(cmd, nil); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if len(got) == 0 {
		t.Fatal("expected non-empty output")
	}
	if !strings.Contains(got, "\n\n") {
		t.Error("expected multiple paragraphs separated by blank lines")
	}
}

func TestRun_ParagraphsFlag(t *testing.T) {
	cmd := lorem.NewCommand()
	cmd.Flags().Set("paragraphs", "2")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := lorem.Run(cmd, nil); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	parts := strings.Split(got, "\n\n")
	if len(parts) != 2 {
		t.Errorf("expected 2 paragraphs, got %d", len(parts))
	}
}

func TestRun_WordsFlag(t *testing.T) {
	cmd := lorem.NewCommand()
	cmd.Flags().Set("words", "10")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := lorem.Run(cmd, nil); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	count := len(strings.Fields(got))
	if count != 10 {
		t.Errorf("expected 10 words, got %d", count)
	}
}

func TestRun_JSON(t *testing.T) {
	cmd := lorem.NewCommand()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	cmd.Flags().Set("words", "5")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := lorem.Run(cmd, nil); err != nil {
		t.Fatal(err)
	}
	var result struct {
		Text string `json:"text"`
	}
	if err := json.Unmarshal([]byte(buf.String()), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, buf.String())
	}
	if result.Text == "" {
		t.Error("expected non-empty text in JSON")
	}
}
