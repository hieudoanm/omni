package chat

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"
)

func TestHandleCommonMsg_WindowSize(t *testing.T) {
	m := NewBaseModel("input")
	handled, cmd := m.HandleCommonMsg(tea.WindowSizeMsg{Width: 120, Height: 40}, nil)
	if !handled {
		t.Error("expected handled=true for WindowSizeMsg")
	}
	if cmd != nil {
		t.Error("expected nil cmd for WindowSizeMsg")
	}
	if m.Width != 120 {
		t.Errorf("expected Width 120, got %d", m.Width)
	}
	if m.Height != 40 {
		t.Errorf("expected Height 40, got %d", m.Height)
	}
}

func TestHandleCommonMsg_StateChat_q(t *testing.T) {
	m := NewBaseModel("input")
	m.WaitingPrefix = true
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: 'q'}, nil)
	if !handled {
		t.Error("expected handled=true")
	}
	if cmd == nil {
		t.Error("expected quit cmd")
	}
	if m.WaitingPrefix {
		t.Error("WaitingPrefix should be false after handling")
	}
}

func TestHandleCommonMsg_StateChat_help(t *testing.T) {
	m := NewBaseModel("input")
	m.WaitingPrefix = true
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: '?'}, nil)
	if !handled {
		t.Error("expected handled=true")
	}
	if cmd != nil {
		t.Error("expected nil cmd")
	}
	if !strings.Contains(m.Display[len(m.Display)-1].Content, "/help") {
		t.Errorf("expected /help in displayed content, got %v", m.Display)
	}
}

func TestHandleCommonMsg_StateChat_default_waiting(t *testing.T) {
	m := NewBaseModel("input")
	m.WaitingPrefix = true
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: 'a'}, nil)
	if !handled {
		t.Error("expected handled=true")
	}
	if cmd != nil {
		t.Error("expected nil cmd")
	}
}

func TestHandleCommonMsg_StateChat_enter_empty(t *testing.T) {
	m := NewBaseModel("input")
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: tea.KeyEnter}, nil)
	if !handled {
		t.Error("expected handled=true")
	}
	if cmd != nil {
		t.Error("expected nil cmd for empty text")
	}
}

func TestHandleCommonMsg_StateChat_enter_slash(t *testing.T) {
	m := NewBaseModel("input")
	m.Input.SetValue("/help")
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: tea.KeyEnter}, nil)
	if !handled {
		t.Error("expected handled=true")
	}
	if cmd != nil {
		t.Error("expected nil cmd for slash text")
	}
}

func TestHandleCommonMsg_StateChat_enter_onEnter(t *testing.T) {
	m := NewBaseModel("input")
	m.Input.SetValue("hello")
	called := false
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: tea.KeyEnter}, func(text string) tea.Cmd {
		called = true
		if text != "hello" {
			t.Errorf("expected text 'hello', got %q", text)
		}
		return nil
	})
	if !handled {
		t.Error("expected handled=true")
	}
	if !called {
		t.Error("onEnter was not called")
	}
	if cmd != nil {
		t.Error("expected nil cmd from onEnter")
	}
}

func TestHandleCommonMsg_StateChat_ctrlX(t *testing.T) {
	m := NewBaseModel("input")
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: 'x', Mod: tea.ModCtrl}, nil)
	if !handled {
		t.Error("expected handled=true")
	}
	if cmd != nil {
		t.Error("expected nil cmd")
	}
	if !m.WaitingPrefix {
		t.Error("WaitingPrefix should be true after ctrl+x")
	}
}

func TestHandleCommonMsg_StateChat_esc(t *testing.T) {
	m := NewBaseModel("input")
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: tea.KeyEscape}, nil)
	if !handled {
		t.Error("expected handled=true")
	}
	if cmd == nil {
		t.Error("expected quit cmd")
	}
}

func TestHandleCommonMsg_StateChat_ctrlC(t *testing.T) {
	m := NewBaseModel("input")
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: 'c', Mod: tea.ModCtrl}, nil)
	if !handled {
		t.Error("expected handled=true")
	}
	if cmd == nil {
		t.Error("expected quit cmd")
	}
}

func TestHandleCommonMsg_StateLoading_esc(t *testing.T) {
	m := NewBaseModel("input")
	m.State = StateLoading
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: tea.KeyEscape}, nil)
	if !handled {
		t.Error("expected handled=true")
	}
	if cmd == nil {
		t.Error("expected quit cmd")
	}
}

func TestHandleCommonMsg_StateLoading_ctrlC(t *testing.T) {
	m := NewBaseModel("input")
	m.State = StateLoading
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: 'c', Mod: tea.ModCtrl}, nil)
	if !handled {
		t.Error("expected handled=true")
	}
	if cmd == nil {
		t.Error("expected quit cmd")
	}
}

func TestHandleCommonMsg_StateLoading_ignored(t *testing.T) {
	m := NewBaseModel("input")
	m.State = StateLoading
	handled, cmd := m.HandleCommonMsg(tea.KeyPressMsg{Code: 'a'}, nil)
	if handled {
		t.Error("expected handled=false for non-esc in loading")
	}
	if cmd != nil {
		t.Error("expected nil cmd")
	}
}

func TestHandleCommonMsg_unsupported_msg(t *testing.T) {
	m := NewBaseModel("input")
	handled, cmd := m.HandleCommonMsg(struct{}{}, nil)
	if handled {
		t.Error("expected handled=false for unknown msg")
	}
	if cmd != nil {
		t.Error("expected nil cmd")
	}
}

func TestHandleInputMsg_StateChat_shows_commands(t *testing.T) {
	m := NewBaseModel("input")
	m.Input.SetValue("/help")
	_ = m.HandleInputMsg(tea.WindowSizeMsg{Width: 120, Height: 40})
	if !m.ShowCommands {
		t.Error("ShowCommands should be true when input starts with /")
	}
}

func TestHandleInputMsg_StateChat_no_slash(t *testing.T) {
	m := NewBaseModel("input")
	m.Input.SetValue("hello")
	_ = m.HandleInputMsg(tea.WindowSizeMsg{Width: 120, Height: 40})
	if m.ShowCommands {
		t.Error("ShowCommands should be false when input doesn't start with /")
	}
}

func TestHandleInputMsg_StateLoading(t *testing.T) {
	m := NewBaseModel("input")
	m.State = StateLoading
	_ = m.HandleInputMsg(tea.WindowSizeMsg{Width: 120, Height: 40})
	if m.State != StateLoading {
		t.Error("state should remain loading")
	}
}

func TestHandleInputMsg_no_match(t *testing.T) {
	m := BaseModel{State: State(999)}
	cmd := m.HandleInputMsg(tea.KeyPressMsg{Code: 'a'})
	if cmd != nil {
		t.Error("expected nil cmd for unknown state")
	}
}
