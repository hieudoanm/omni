package chat

import (
	"strings"
	"testing"
	"time"
)

func TestFormatMessage_roles(t *testing.T) {
	tests := []struct {
		name    string
		role    string
		content string
	}{
		{name: "user", role: "user", content: "hello from user"},
		{name: "assistant", role: "assistant", content: "response from assistant"},
		{name: "error", role: "error", content: "something went wrong"},
		{name: "tool", role: "tool", content: "tool result data"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			msg := Message{Role: tt.role, Content: tt.content}
			result := FormatMessage(80, msg)
			if !strings.Contains(result, tt.content) {
				t.Errorf("FormatMessage() missing content %q in result", tt.content)
			}
			if !strings.HasPrefix(result, "\x1b[") {
				t.Errorf("FormatMessage() expected ANSI prefix, got %q", result[:min(10, len(result))])
			}
		})
	}
}

func TestFormatMessage_thought(t *testing.T) {
	msg := Message{Role: "thought", Content: "deep thinking step"}
	result := FormatMessage(80, msg)
	expected := "  deep thinking step"
	if result != expected {
		t.Errorf("got %q, want %q", result, expected)
	}
}

func TestFormatCodeBlock(t *testing.T) {
	tests := []struct {
		name      string
		lang      string
		filename  string
		code      string
		multiLine bool
	}{
		{name: "lang only", lang: "go", filename: "", code: `fmt.Println("hello")`},
		{name: "lang and filename", lang: "python", filename: "main.py", code: "print('hello')"},
		{name: "empty lang", lang: "", filename: "", code: "some raw code"},
		{name: "multi-line", lang: "go", filename: "", code: "line1\nline2", multiLine: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := FormatCodeBlock(tt.lang, tt.filename, tt.code)
			if tt.lang != "" && !strings.Contains(result, tt.lang) {
				t.Errorf("expected lang %q in result %q", tt.lang, result)
			}
			if tt.filename != "" && !strings.Contains(result, tt.filename) {
				t.Errorf("expected filename %q in result %q", tt.filename, result)
			}
			if tt.multiLine {
				for _, line := range strings.Split(tt.code, "\n") {
					if !strings.Contains(result, line) {
						t.Errorf("expected code line %q in result %q", line, result)
					}
				}
			} else if !strings.Contains(result, tt.code) {
				t.Errorf("expected code %q in result %q", tt.code, result)
			}
		})
	}
}

func TestRenderContent_plain(t *testing.T) {
	content := "Hello, world!"
	result := RenderContent(content, 80)
	if !strings.Contains(result, "Hello, world!") {
		t.Errorf("expected content in result, got %q", result)
	}
}

func TestRenderContent_code_block(t *testing.T) {
	content := "Some text\n```go main.go\n\npackage main\n\nfunc main() {}\n```\nMore text"
	result := RenderContent(content, 80)
	if !strings.Contains(result, "func main") {
		t.Errorf("expected code content in rendered output %q", result)
	}
}

func TestRenderContent_unclosed_code_block(t *testing.T) {
	content := "```go\nunclosed code block content"
	result := RenderContent(content, 80)
	if !strings.Contains(result, "unclosed code block content") {
		t.Errorf("expected unclosed code block content in result %q", result)
	}
}

func TestRenderContent_multiple_code_blocks(t *testing.T) {
	content := "```go\ncode1\n```\ntext between\n```py\ncode2\n```"
	result := RenderContent(content, 80)
	if !strings.Contains(result, "code1") {
		t.Errorf("expected code1 in result %q", result)
	}
	if !strings.Contains(result, "code2") {
		t.Errorf("expected code2 in result %q", result)
	}
}

func TestNewTextArea(t *testing.T) {
	ta := NewTextArea("test placeholder")
	if ta.Placeholder != "test placeholder" {
		t.Errorf("expected placeholder %q, got %q", "test placeholder", ta.Placeholder)
	}
	if !ta.Focused() {
		t.Errorf("expected textarea to be focused")
	}
}

func TestNewViewport(t *testing.T) {
	vp := NewViewport()
	if vp.Width() != 80 {
		t.Errorf("expected width 80, got %d", vp.Width())
	}
	if vp.Height() != 10 {
		t.Errorf("expected height 10, got %d", vp.Height())
	}
}

func TestNewSpinner(t *testing.T) {
	sp := NewSpinner()
	if sp.Spinner.FPS == 0 {
		t.Errorf("expected spinner to have FPS set")
	}
}

func TestNewBaseModel(t *testing.T) {
	m := NewBaseModel("test placeholder")
	if m.State != StateChat {
		t.Errorf("expected StateChat, got %v", m.State)
	}
	if m.Width != 80 {
		t.Errorf("expected Width 80, got %d", m.Width)
	}
	if m.Height != 24 {
		t.Errorf("expected Height 24, got %d", m.Height)
	}
}

func TestCommonView_contains_body(t *testing.T) {
	m := NewBaseModel("input")
	m.AppendMessage("user", "test message")
	v := CommonView(&m, "test-model", "")
	if !strings.Contains(v.Content, "test-model") {
		t.Errorf("expected model name in view, got %q", v.Content)
	}
	if !strings.Contains(v.Content, "test message") {
		t.Errorf("expected message content in view, got %q", v.Content)
	}
}

func TestCommonView_with_extra_body(t *testing.T) {
	m := NewBaseModel("input")
	v := CommonView(&m, "test-model", "extra body content")
	if !strings.Contains(v.Content, "extra body content") {
		t.Errorf("expected extra body in view, got %q", v.Content)
	}
}

func TestCommonView_with_commands(t *testing.T) {
	m := NewBaseModel("")
	m.Input.SetValue("/help")
	v := CommonView(&m, "test-model", "")
	if !strings.Contains(v.Content, "Show help") {
		t.Errorf("expected command help in view, got %q", v.Content)
	}
	if !strings.Contains(v.Content, "Clear conversation") {
		t.Errorf("expected 'Clear conversation' in view, got %q", v.Content)
	}
}

func TestCommonView_shows_status_line(t *testing.T) {
	m := NewBaseModel("input")
	m.TokenCount = 42
	m.Display = append(m.Display, Message{Role: "user", Content: "hi"})
	m.Refresh()
	v := CommonView(&m, "test-model", "")
	if !strings.Contains(v.Content, "42 tokens") {
		t.Errorf("expected token count in view, got %q", v.Content)
	}
	if !strings.Contains(v.Content, "1 messages") {
		t.Errorf("expected message count in view, got %q", v.Content)
	}
}

func TestUpdateViewHeight(t *testing.T) {
	m := &BaseModel{History: NewViewport(), ShowCommands: false}
	m.UpdateViewHeight(30)
	if m.History.Height() != 23 {
		t.Errorf("expected height 23, got %d", m.History.Height())
	}
}

func TestUpdateViewHeight_with_commands(t *testing.T) {
	m := &BaseModel{History: NewViewport(), ShowCommands: true}
	m.UpdateViewHeight(30)
	if m.History.Height() != 19 {
		t.Errorf("expected height 19, got %d", m.History.Height())
	}
}

func TestRefresh(t *testing.T) {
	m := NewBaseModel("input")
	m.Display = append(m.Display, Message{Role: "user", Content: "test content"})
	m.Refresh()
	content := m.History.View()
	if !strings.Contains(content, "test content") {
		t.Errorf("expected test content in history view, got %q", content)
	}
}

func TestRefresh_loading_state(t *testing.T) {
	m := NewBaseModel("input")
	m.State = StateLoading
	m.Display = append(m.Display, Message{Role: "assistant", Content: "working..."})
	m.Refresh()
	content := m.History.View()
	if !strings.Contains(content, "thinking") {
		t.Errorf("expected 'thinking' indicator in loading state, got %q", content)
	}
}

func TestAppendMessage(t *testing.T) {
	m := NewBaseModel("input")
	m.AppendMessage("user", "hello world")
	if len(m.Display) != 1 {
		t.Fatalf("expected 1 message, got %d", len(m.Display))
	}
	if m.Display[0].Role != "user" {
		t.Errorf("expected role 'user', got %q", m.Display[0].Role)
	}
	if !strings.Contains(m.Display[0].Content, "hello world") {
		t.Errorf("expected content in display[0], got %q", m.Display[0].Content)
	}
}

func TestAppendMessage_multiple(t *testing.T) {
	m := NewBaseModel("input")
	m.AppendMessage("user", "first")
	m.AppendMessage("assistant", "second")
	if len(m.Display) != 2 {
		t.Fatalf("expected 2 messages, got %d", len(m.Display))
	}
	if m.Display[1].Role != "assistant" {
		t.Errorf("expected role 'assistant', got %q", m.Display[1].Role)
	}
}

func TestRecordThought(t *testing.T) {
	m := NewBaseModel("input")
	m.ThoughtStart = time.Now().Add(-2 * time.Second)
	m.RecordThought()
	if len(m.Display) != 1 {
		t.Fatalf("expected 1 message, got %d", len(m.Display))
	}
	if m.Display[0].Role != "thought" {
		t.Errorf("expected role 'thought', got %q", m.Display[0].Role)
	}
	if !strings.Contains(m.Display[0].Content, "Thought") {
		t.Errorf("expected 'Thought' in content, got %q", m.Display[0].Content)
	}
}
