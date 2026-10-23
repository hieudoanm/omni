package code

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"

	or "github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/openrouterlib"
)

func TestCodeModel_Init(t *testing.T) {
	m := codeInitialModel("test-model")
	if cmd := m.Init(); cmd != nil {
		t.Error("Init() should return nil")
	}
}

func TestCodeInitialModel_Defaults(t *testing.T) {
	m := codeInitialModel("test-model")
	if m.modelChoice != "test-model" {
		t.Errorf("expected model 'test-model', got %q", m.modelChoice)
	}
	if m.appState != appNormal {
		t.Errorf("expected appState normal, got %d", m.appState)
	}
	if len(m.messages) == 0 {
		t.Error("expected initial messages")
	}
}

func TestCodeModel_UpdateNonQuitKey(t *testing.T) {
	m := codeInitialModel("test-model")
	_, cmd := m.Update(tea.KeyPressMsg{Code: 'q'})
	if cmd != nil {
		t.Error("expected nil cmd for non-quit key 'q'")
	}
}

func TestCodeModel_UpdateCtrlC(t *testing.T) {
	m := codeInitialModel("test-model")
	_, cmd := m.Update(tea.KeyPressMsg{Code: 'c', Mod: tea.ModCtrl})
	if cmd == nil {
		t.Error("expected quit command on ctrl+c")
	}
}

func TestStatusIcon(t *testing.T) {
	tests := []struct {
		status or.ProbeStatus
		want   string
	}{
		{or.StatusOK, "OK"},
		{or.StatusRateLimited, "RL"},
		{or.StatusRestricted, "RE"},
		{or.StatusError, "ER"},
		{or.ProbeStatus(99), "?"},
	}
	for _, tc := range tests {
		t.Run(tc.want, func(t *testing.T) {
			got := statusIcon(tc.status)
			if got != tc.want {
				t.Errorf("statusIcon(%d) = %q, want %q", tc.status, got, tc.want)
			}
		})
	}
}

func TestMin(t *testing.T) {
	if got := min(5, 10); got != 5 {
		t.Errorf("min(5,10) = %d, want 5", got)
	}
	if got := min(10, 5); got != 5 {
		t.Errorf("min(10,5) = %d, want 5", got)
	}
	if got := min(-3, 2); got != -3 {
		t.Errorf("min(-3,2) = %d, want -3", got)
	}
}

func TestToolDefinitions_NotEmpty(t *testing.T) {
	defs := toolDefinitions()
	if len(defs) == 0 {
		t.Fatal("toolDefinitions() should not be empty")
	}
	for i, d := range defs {
		fn, ok := d["function"].(map[string]interface{})
		if !ok {
			t.Errorf("defs[%d] missing 'function' key", i)
			continue
		}
		if fn["name"] == "" {
			t.Errorf("defs[%d] has empty name", i)
		}
	}
}

func TestCodeInitMessages_ContainsSystemPrompt(t *testing.T) {
	msgs := codeInitMessages()
	if len(msgs) == 0 {
		t.Fatal("codeInitMessages() should not be empty")
	}
	first := msgs[0]
	if first["role"] != "system" {
		t.Errorf("expected first message role 'system', got %q", first["role"])
	}
	content, ok := first["content"].(string)
	if !ok {
		t.Fatal("expected string content")
	}
	if !strings.Contains(content, "coding assistant") {
		t.Errorf("expected system prompt to mention 'coding assistant', got %q", content)
	}
}

func TestFormatToolConfirm(t *testing.T) {
	calls := []map[string]interface{}{
		{
			"function": map[string]interface{}{
				"name":      "read_file",
				"arguments": `{"path": "/tmp/test.txt"}`,
			},
		},
	}
	result := formatToolConfirm(calls)
	if !strings.Contains(result, "read_file") {
		t.Errorf("expected 'read_file' in formatted output, got %q", result)
	}
	if !strings.Contains(result, "Approve") {
		t.Errorf("expected 'Approve' prompt in output, got %q", result)
	}
}

func TestCodeModel_ViewContainsModelName(t *testing.T) {
	m := codeInitialModel("test-model")
	v := m.View()
	if !strings.Contains(v.Content, "OpenRouter") {
		t.Errorf("expected OpenRouter in view, got %q", v.Content)
	}
}

func TestAppendUserMessage(t *testing.T) {
	m := codeInitialModel("test-model")
	m.appendUserMessage("hello")
	if len(m.messages) != 2 {
		t.Errorf("expected 2 messages (sys+user), got %d", len(m.messages))
	}
	if m.messages[1]["role"] != "user" {
		t.Errorf("expected user role, got %q", m.messages[1]["role"])
	}
	if len(m.Display) == 0 {
		t.Error("expected Display to have messages")
	}
}

func TestHandleSlash_Help(t *testing.T) {
	m := codeInitialModel("test-model")
	m.handleSlash("/help")
	hasHelp := false
	for _, d := range m.Display {
		if strings.Contains(d.Content, "help") {
			hasHelp = true
			break
		}
	}
	if !hasHelp {
		t.Error("expected help content after /help")
	}
}

func TestHandleSlash_New(t *testing.T) {
	m := codeInitialModel("test-model")
	m.messages = append(m.messages, map[string]interface{}{"role": "user", "content": "hi"})
	m.handleSlash("/new")
	if len(m.messages) != 1 {
		t.Errorf("expected only system message after /new, got %d", len(m.messages))
	}
}

func TestHandleSlash_Unknown(t *testing.T) {
	m := codeInitialModel("test-model")
	m.handleSlash("/unknown")
	hasError := false
	for _, d := range m.Display {
		if strings.Contains(d.Content, "Unknown") {
			hasError = true
			break
		}
	}
	if !hasError {
		t.Error("expected error for unknown slash command")
	}
}
