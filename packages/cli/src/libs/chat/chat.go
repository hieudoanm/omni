package chat

import (
	"fmt"
	"strings"
	"time"

	markdown "github.com/MichaelMure/go-term-markdown"

	"charm.land/bubbles/v2/spinner"
	"charm.land/bubbles/v2/textarea"
	"charm.land/bubbles/v2/viewport"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"
)

type State int

const (
	StateChat State = iota
	StateLoading
)

type Message struct {
	Role    string
	Content string
}

type BaseModel struct {
	State State

	Width, Height int

	History viewport.Model
	Display []Message

	Input textarea.Model
	Spin  spinner.Model

	WaitingPrefix  bool
	TokenCount     int
	ShowCommands   bool
	ThoughtStart   time.Time
	ThoughtSeconds float64
}

var (
	DimColor  = lipgloss.Color("240")
	PurpleClr = lipgloss.Color("99")
	GreenClr  = lipgloss.Color("42")
	CodeBg    = lipgloss.Color("233")

	LabelUser = lipgloss.NewStyle().Foreground(PurpleClr).Bold(true).Render
	LabelAsst = lipgloss.NewStyle().Foreground(GreenClr).Bold(true).Render
	LabelErr  = lipgloss.NewStyle().Foreground(lipgloss.Color("196")).Bold(true).Render
	DimText   = lipgloss.NewStyle().Foreground(DimColor).Render
	BodyStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("250"))
)

func NewTextArea(placeholder string) textarea.Model {
	ti := textarea.New()
	ti.Placeholder = placeholder
	ti.Focus()
	ti.CharLimit = 5000
	ti.ShowLineNumbers = false
	ti.Prompt = ""
	ti.SetHeight(1)

	s := ti.Styles()
	s.Focused.Base = lipgloss.NewStyle().Background(CodeBg)
	s.Focused.Text = lipgloss.NewStyle().Background(CodeBg)
	s.Focused.CursorLine = lipgloss.NewStyle().Background(CodeBg)
	s.Focused.Placeholder = lipgloss.NewStyle().Background(CodeBg)
	s.Focused.Prompt = lipgloss.NewStyle().Background(CodeBg).Foreground(CodeBg)
	s.Focused.LineNumber = lipgloss.NewStyle().Background(CodeBg)
	s.Focused.CursorLineNumber = lipgloss.NewStyle().Background(CodeBg)
	s.Focused.EndOfBuffer = lipgloss.NewStyle().Background(CodeBg)
	ti.SetStyles(s)

	return ti
}

func NewViewport() viewport.Model {
	return viewport.New(
		viewport.WithWidth(80),
		viewport.WithHeight(10),
	)
}

func NewSpinner() spinner.Model {
	sp := spinner.New()
	sp.Spinner = spinner.Dot
	return sp
}

func NewBaseModel(placeholder string) BaseModel {
	return BaseModel{
		State:   StateChat,
		Input:   NewTextArea(placeholder),
		History: NewViewport(),
		Spin:    NewSpinner(),
		Width:   80,
		Height:  24,
	}
}

func (m *BaseModel) Refresh() {
	var buf strings.Builder
	for _, msg := range m.Display {
		buf.WriteString(FormatMessage(m.Width, msg))
		buf.WriteString("\n\n")
	}
	if m.State == StateLoading {
		thinkingStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("220"))
		buf.WriteString("  " + thinkingStyle.Render(m.Spin.View()+" thinking..."))
	}
	m.History.SetContent(buf.String())
	m.History.GotoBottom()
}

func FormatMessage(width int, msg Message) string {
	if msg.Role == "thought" {
		return "  " + msg.Content
	}
	var borderColor = DimColor
	switch msg.Role {
	case "user":
		borderColor = lipgloss.Color("39")
	case "assistant":
		borderColor = GreenClr
	case "error":
		borderColor = lipgloss.Color("196")
	case "tool":
		borderColor = lipgloss.Color("214")
	}
	box := lipgloss.NewStyle().
		Background(CodeBg).
		Padding(1, 1, 1, 2).
		Border(lipgloss.ThickBorder(), false, false, false, true).
		BorderForeground(borderColor).
		Width(width)
	return box.Render(BodyStyle.Render(msg.Content))
}

func FormatCodeBlock(lang, filename, code string) string {
	headerStyle := lipgloss.NewStyle().
		Background(lipgloss.Color("234")).
		Foreground(DimColor).
		Padding(0, 2)
	hl := headerStyle.Render(lang)
	if filename != "" {
		hl += DimText("  ") + headerStyle.Render(filename)
	}
	codeStyle := lipgloss.NewStyle().
		Background(CodeBg).
		Foreground(lipgloss.Color("250")).
		Padding(0, 2)
	return hl + "\n" + codeStyle.Render(code)
}

func (m *BaseModel) AppendMessage(role, content string) {
	rendered := RenderContent(content, m.Width-4)
	m.Display = append(m.Display, Message{Role: role, Content: rendered})
	m.Refresh()
}

func RenderContent(content string, width int) string {
	var blocks []string
	lines := strings.Split(content, "\n")
	var inCode bool
	var codeBuf strings.Builder
	var lang, filename string

	flushCode := func() {
		if codeBuf.Len() == 0 {
			return
		}
		code := strings.TrimRight(codeBuf.String(), "\n")
		blocks = append(blocks, FormatCodeBlock(lang, filename, code))
		codeBuf.Reset()
		lang = ""
		filename = ""
	}

	for _, line := range lines {
		if strings.HasPrefix(line, "```") && !inCode {
			inCode = true
			rest := strings.TrimSpace(strings.TrimPrefix(line, "```"))
			parts := strings.Fields(rest)
			if len(parts) > 0 {
				lang = parts[0]
				if len(parts) > 1 {
					filename = strings.Join(parts[1:], " ")
				}
			}
			continue
		}
		if strings.HasPrefix(line, "```") && inCode {
			inCode = false
			flushCode()
			continue
		}
		if inCode {
			codeBuf.WriteString(line + "\n")
		} else {
			blocks = append(blocks, line)
		}
	}
	if inCode {
		flushCode()
	}

	text := strings.Join(blocks, "\n")
	rendered := string(markdown.Render(text, width, 0))
	rendered = strings.ReplaceAll(rendered, "\x1b[0m", "\x1b[0;38;5;250;48;5;233m")
	return strings.TrimRight(rendered, "\n")
}

func (m *BaseModel) UpdateViewHeight(height int) {
	overhead := 7
	if m.ShowCommands {
		overhead = 11
	}
	m.History.SetHeight(height - overhead)
}

func (m *BaseModel) RecordThought() {
	m.ThoughtSeconds = time.Since(m.ThoughtStart).Seconds()
	thinkingStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("220"))
	thoughtMsg := Message{Role: "thought", Content: thinkingStyle.Render(fmt.Sprintf("+ Thought: %.1f s", m.ThoughtSeconds))}
	m.Display = append(m.Display, thoughtMsg)
}

// HandleCommonMsg handles WindowSizeMsg and generic KeyMsg that are identical
// across both Gemini and OpenRouter TUIs. Returns (handled, cmd).
// If handled is false, the caller should process the message itself.
// onEnter is called when the user presses enter with non-slash text.
func (m *BaseModel) HandleCommonMsg(msg tea.Msg, onEnter func(text string) tea.Cmd) (bool, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.Width = msg.Width
		m.Height = msg.Height
		m.History.SetWidth(msg.Width)
		m.UpdateViewHeight(msg.Height)
		m.Input.SetWidth(msg.Width - 4)
		return true, nil

	case tea.KeyMsg:
		switch m.State {
		case StateChat:
			if m.WaitingPrefix {
				m.WaitingPrefix = false
				switch msg.String() {
				case "q":
					return true, tea.Quit
				case "?":
					m.AppendMessage("assistant", "Available commands:\n\n- /help  — Show help\n- /new   — Clear conversation\n- /undo  — Remove last exchange\n- /exit  — Quit\n\nKeys: enter to send, ctrl+x ? for help, ctrl+x q / esc / ctrl+c to quit")
					return true, nil
				default:
					return true, nil
				}
			}
			switch msg.String() {
			case "enter":
				text := strings.TrimSpace(m.Input.Value())
				if text == "" {
					return true, nil
				}
				if strings.HasPrefix(text, "/") {
					return true, nil // caller handles slashes
				}
				m.ThoughtStart = time.Now()
				m.ThoughtSeconds = 0
				return true, onEnter(text)
			case "ctrl+x":
				m.WaitingPrefix = true
				return true, nil
			case "esc", "ctrl+c":
				return true, tea.Quit
			}

		case StateLoading:
			if msg.String() == "esc" || msg.String() == "ctrl+c" {
				return true, tea.Quit
			}
		}
	}

	return false, nil
}

// HandleInputMsg handles input/component updates for chat and loading states.
func (m *BaseModel) HandleInputMsg(msg tea.Msg) tea.Cmd {
	switch m.State {
	case StateChat:
		var cmds []tea.Cmd
		var cmd tea.Cmd
		m.Input, cmd = m.Input.Update(msg)
		cmds = append(cmds, cmd)
		m.ShowCommands = strings.HasPrefix(m.Input.Value(), "/")
		m.UpdateViewHeight(m.Height)
		m.History, cmd = m.History.Update(msg)
		cmds = append(cmds, cmd)
		return tea.Batch(cmds...)

	case StateLoading:
		var cmd tea.Cmd
		m.Spin, cmd = m.Spin.Update(msg)
		m.Refresh()
		var vpcmd tea.Cmd
		m.History, vpcmd = m.History.Update(msg)
		return tea.Batch(cmd, vpcmd)
	}
	return nil
}

// CommonView renders the shared parts of the TUI view.
// Returns the view and whether commands dropdown should be shown.
func CommonView(m *BaseModel, modelName string, extraBody string) tea.View {
	body := m.History.View()
	if extraBody != "" {
		body += "\n\n" + extraBody
	}

	inputLine := m.Input.View()
	promptRow := lipgloss.NewStyle().
		Background(CodeBg).
		Padding(1, 1, 1, 2).
		Border(lipgloss.ThickBorder(), false, false, false, true).
		BorderForeground(PurpleClr).
		Width(m.Width).
		Render(inputLine + "\n\n" + modelName)
	chatHeader := DimText(fmt.Sprintf("%d messages", len(m.Display)))
	statusConnected := lipgloss.NewStyle().Foreground(GreenClr).Render("●") + DimText(" connected")
	exitKey := DimText("ctrl+x q to exit")
	helpKey := DimText("ctrl+x ? for help")

	statusLine := fmt.Sprintf("%s  ·  %s  ·  %s  ·  %s  ·  %s",
		statusConnected, DimText(fmt.Sprintf("%d tokens", m.TokenCount)), chatHeader, exitKey, helpKey)

	var commands string
	if strings.HasPrefix(m.Input.Value(), "/") {
		cmdStyle := lipgloss.NewStyle().Background(CodeBg).Padding(1, 1, 0, 2).Width(m.Width)
		commands = cmdStyle.Render(
			DimText("/help  ")+"Show help"+"\n"+
				DimText("/new   ")+"Clear conversation"+"\n"+
				DimText("/undo  ")+"Remove last exchange"+"\n"+
				DimText("/exit  ")+"Quit",
		) + "\n"
	}

	v := tea.NewView(fmt.Sprintf(
		"%s\n\n%s%s\n\n%s",
		body,
		commands,
		promptRow,
		statusLine,
	))
	v.AltScreen = true
	v.MouseMode = tea.MouseModeCellMotion
	return v
}
