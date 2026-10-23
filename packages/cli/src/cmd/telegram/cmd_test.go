package telegram

import (
	"encoding/json"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/send"
	webhookDelete "github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/webhook/delete"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/webhook/info"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/webhook/set"
	"github.com/spf13/cobra"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "telegram" {
		t.Errorf("expected Use 'telegram', got %q", cmd.Use)
	}

	expected := []string{"message", "webhook", "chat", "location", "venue", "contact", "poll", "dice", "sticker", "bot", "forum", "game", "callback", "inline", "invoice", "gift"}
	subs := subcommandNames(cmd)
	for _, name := range expected {
		if !contains(subs, name) {
			t.Errorf("expected subcommand %q not found", name)
		}
	}
}

func subcommandNames(cmd *cobra.Command) []string {
	var names []string
	for _, c := range cmd.Commands() {
		names = append(names, c.Name())
	}
	return names
}

func contains(slice []string, s string) bool {
	for _, v := range slice {
		if v == s {
			return true
		}
	}
	return false
}

func TestSendResponseUnmarshal(t *testing.T) {
	data := `{"ok": true}`
	var resp send.SendResponse
	if err := json.Unmarshal([]byte(data), &resp); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !resp.Ok {
		t.Error("expected Ok to be true")
	}
}

func TestSendResponseUnmarshalFalse(t *testing.T) {
	data := `{"ok": false}`
	var resp send.SendResponse
	if err := json.Unmarshal([]byte(data), &resp); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Ok {
		t.Error("expected Ok to be false")
	}
}

func TestSetResponseUnmarshal(t *testing.T) {
	data := `{"ok": true}`
	var resp set.SetResponse
	if err := json.Unmarshal([]byte(data), &resp); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !resp.Ok {
		t.Error("expected Ok to be true")
	}
}

func TestDeleteResponseUnmarshal(t *testing.T) {
	data := `{"ok": true}`
	var resp webhookDelete.DeleteResponse
	if err := json.Unmarshal([]byte(data), &resp); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !resp.Ok {
		t.Error("expected Ok to be true")
	}
}

func TestGetInfoResponseUnmarshal(t *testing.T) {
	data := `{"ok": true, "result": {"url": "https://example.com"}}`
	var resp info.GetInfoResponse
	if err := json.Unmarshal([]byte(data), &resp); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !resp.Ok {
		t.Error("expected Ok to be true")
	}
}

func TestGetInfoResponseUnmarshalFalse(t *testing.T) {
	data := `{"ok": false}`
	var resp info.GetInfoResponse
	if err := json.Unmarshal([]byte(data), &resp); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Ok {
		t.Error("expected Ok to be false")
	}
}

func TestSendResponseUnmarshalEmpty(t *testing.T) {
	data := `{}`
	var resp send.SendResponse
	if err := json.Unmarshal([]byte(data), &resp); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Ok {
		t.Error("expected Ok to be false for empty JSON")
	}
}

func TestNewCommand_TelegramSubcommandShortDescriptions(t *testing.T) {
	cmd := NewCommand()
	short := make(map[string]string)
	for _, c := range cmd.Commands() {
		short[c.Name()] = c.Short
	}
	expect := map[string]string{
		"message":  "Send Telegram messages",
		"webhook":  "Manage Telegram webhooks",
		"bot":      "Bot management",
		"forum":    "Manage forum topics",
		"game":     "Send and manage games",
		"callback": "Answer callback queries",
		"inline":   "Answer inline queries",
		"invoice":  "Create and manage invoices",
		"gift":     "Send gifts",
	}
	for name, want := range expect {
		got, ok := short[name]
		if !ok {
			t.Errorf("missing subcommand %q", name)
			continue
		}
		if got != want {
			t.Errorf("subcommand %q: Short = %q, want %q", name, got, want)
		}
	}
}
