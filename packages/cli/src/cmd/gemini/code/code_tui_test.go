package code

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"

	"github.com/hieudoanm/omni/packages/cli/src/libs/api/gemini.google.com"
	"github.com/hieudoanm/omni/packages/cli/src/libs/chat"
)

func TestCodeModel_Init(t *testing.T) {
	m := codeInitialModel()
	if cmd := m.Init(); cmd != nil {
		t.Error("Init() should return nil")
	}
}

func TestCodeInitialModel_Defaults(t *testing.T) {
	m := codeInitialModel()
	if m.modelChoice != string(gemini.Model25Flash) {
		t.Errorf("expected default model %q, got %q", gemini.Model25Flash, m.modelChoice)
	}
	if m.State != chat.StateChat {
		t.Errorf("expected initial state chat, got %d", m.State)
	}
}

func TestCodeModel_UpdateNonQuitKey(t *testing.T) {
	m := codeInitialModel()
	_, cmd := m.Update(tea.KeyPressMsg{Code: 'q'})
	if cmd != nil {
		t.Error("expected nil cmd for non-quit key 'q'")
	}
}

func TestCodeModel_UpdateCtrlC(t *testing.T) {
	m := codeInitialModel()
	_, cmd := m.Update(tea.KeyPressMsg{Code: 'c', Mod: tea.ModCtrl})
	if cmd == nil {
		t.Error("expected quit command on ctrl+c")
	}
}

func TestModelName(t *testing.T) {
	tests := []struct {
		id   string
		want string
	}{
		{string(gemini.Model35Flash), "Gemini 3.5 Flash"},
		{string(gemini.Model25Pro), "Gemini 2.5 Pro"},
		{string(gemini.Model20Flash), "Gemini 2.0 Flash"},
		{"unknown-model", "unknown-model"},
	}
	for _, tc := range tests {
		t.Run(tc.id, func(t *testing.T) {
			got := modelName(tc.id)
			if got != tc.want {
				t.Errorf("modelName(%q) = %q, want %q", tc.id, got, tc.want)
			}
		})
	}
}

func TestTextModels_ListNotEmpty(t *testing.T) {
	if len(textModels) == 0 {
		t.Fatal("textModels should not be empty")
	}
	for i, m := range textModels {
		if m.ID == "" {
			t.Errorf("textModels[%d] has empty ID", i)
		}
		if m.Name == "" {
			t.Errorf("textModels[%d] has empty Name", i)
		}
	}
}

func TestAppendUserMessage(t *testing.T) {
	m := codeInitialModel()
	m.appendUserMessage("hello")
	if len(m.messages) != 1 {
		t.Errorf("expected 1 message, got %d", len(m.messages))
	}
	if m.messages[0].Role != gemini.RoleUser {
		t.Errorf("expected user role, got %q", m.messages[0].Role)
	}
	if len(m.Display) == 0 {
		t.Error("expected Display to have messages")
	}
}

func TestSwitchModel_Valid(t *testing.T) {
	m := codeInitialModel()
	m.switchModel(1)
	if m.modelChoice != textModels[0].ID {
		t.Errorf("expected model %q, got %q", textModels[0].ID, m.modelChoice)
	}
}

func TestSwitchModel_InvalidLow(t *testing.T) {
	m := codeInitialModel()
	m.switchModel(0)
	if len(m.Display) == 0 {
		t.Error("expected error message for invalid model")
	}
}

func TestSwitchModel_InvalidHigh(t *testing.T) {
	m := codeInitialModel()
	m.switchModel(999)
	if len(m.Display) == 0 {
		t.Error("expected error message for invalid model")
	}
}

func TestCodeModel_ViewContainsModelName(t *testing.T) {
	m := codeInitialModel()
	v := m.View()
	if !strings.Contains(v.Content, "Gemini") {
		t.Errorf("expected Gemini in view, got %q", v.Content)
	}
}

func TestHandleSlash_Help(t *testing.T) {
	m := codeInitialModel()
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
	m := codeInitialModel()
	m.messages = append(m.messages, gemini.Content{Role: gemini.RoleUser, Parts: []gemini.Part{{Text: "hi"}}})
	m.handleSlash("/new")
	if len(m.messages) != 0 {
		t.Errorf("expected empty messages after /new, got %d", len(m.messages))
	}
}

func TestHandleSlash_Unknown(t *testing.T) {
	m := codeInitialModel()
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

func TestHandleSlash_Empty(t *testing.T) {
	m := &codeModel{}
	cmd := m.handleSlash("")
	if cmd != nil {
		t.Error("expected nil cmd for empty slash command")
	}
}
