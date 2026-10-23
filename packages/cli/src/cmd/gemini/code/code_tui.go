package code

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/libs/api/gemini.google.com"
	"github.com/hieudoanm/omni/packages/cli/src/libs/chat"

	tea "charm.land/bubbletea/v2"
)

type modelEntry struct {
	ID   string
	Name string
}

var textModels = []modelEntry{
	{ID: string(gemini.Model35Flash), Name: "Gemini 3.5 Flash"},
	{ID: string(gemini.Model31FlashLite), Name: "Gemini 3.1 Flash-Lite"},
	{ID: string(gemini.Model31ProPreview), Name: "Gemini 3.1 Pro Preview"},
	{ID: string(gemini.Model3FlashPreview), Name: "Gemini 3 Flash Preview"},
	{ID: string(gemini.Model25Pro), Name: "Gemini 2.5 Pro"},
	{ID: string(gemini.Model25Flash), Name: "Gemini 2.5 Flash"},
	{ID: string(gemini.Model25FlashLite), Name: "Gemini 2.5 Flash-Lite"},
	{ID: string(gemini.Model20Flash), Name: "Gemini 2.0 Flash"},
	{ID: string(gemini.Model20FlashLite), Name: "Gemini 2.0 Flash Lite"},
}

type codeResultMsg struct {
	response *gemini.GenerateContentResponse
	err      error
}

type codeModel struct {
	chat.BaseModel

	messages    []gemini.Content
	modelChoice string
}

func codeInitialModel() codeModel {
	m := codeModel{
		BaseModel:   chat.NewBaseModel("Ask Gemini... (@ for files, ! for shell commands)"),
		modelChoice: string(gemini.Model25Flash),
	}
	m.Refresh()
	return m
}

func (m codeModel) Init() tea.Cmd {
	return nil
}

func (m *codeModel) appendUserMessage(text string) {
	m.messages = append(m.messages, gemini.Content{
		Role:  gemini.RoleUser,
		Parts: []gemini.Part{{Text: text}},
	})
	m.AppendMessage("user", text)
}

func sendToGemini(model gemini.Model, messages []gemini.Content) tea.Cmd {
	return func() tea.Msg {
		apiKey := os.Getenv("GEMINI_API_KEY")
		if apiKey == "" {
			return codeResultMsg{err: fmt.Errorf("GEMINI_API_KEY not set")}
		}

		client := gemini.NewGeminiClient(apiKey)
		resp, err := client.GenerateContent(model, messages)
		if err != nil {
			return codeResultMsg{err: fmt.Errorf("API request: %w", err)}
		}

		if len(resp.Candidates) == 0 {
			return codeResultMsg{err: fmt.Errorf("no candidates returned")}
		}

		return codeResultMsg{response: resp}
	}
}

func (m codeModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	if handled, cmd := m.BaseModel.HandleCommonMsg(msg, func(text string) tea.Cmd {
		m.appendUserMessage(text)
		m.Input.Reset()
		m.State = chat.StateLoading
		return tea.Batch(
			m.Spin.Tick,
			sendToGemini(gemini.Model(m.modelChoice), m.messages),
		)
	}); handled {
		if cmd != nil {
			return m, cmd
		}
		if keyMsg, ok := msg.(tea.KeyMsg); ok && keyMsg.String() == "enter" {
			text := strings.TrimSpace(m.Input.Value())
			if strings.HasPrefix(text, "/") {
				m.Input.Reset()
				cmd := m.handleSlash(text)
				return m, cmd
			}
		}
		return m, nil
	}

	switch msg := msg.(type) {
	case codeResultMsg:
		if msg.err != nil {
			m.State = chat.StateChat
			m.RecordThought()
			m.AppendMessage("error", msg.err.Error())
			return m, nil
		}
		content := msg.response.Candidates[0].Content.Parts[0].Text
		m.messages = append(m.messages, gemini.Content{
			Role:  gemini.RoleModel,
			Parts: []gemini.Part{{Text: content}},
		})
		m.State = chat.StateChat
		m.TokenCount = msg.response.UsageMetadata.TotalTokenCount
		m.RecordThought()
		m.AppendMessage("assistant", content)
		return m, nil
	}

	cmd := m.BaseModel.HandleInputMsg(msg)
	return m, cmd
}

func (m *codeModel) handleSlash(cmd string) tea.Cmd {
	parts := strings.Fields(cmd)
	if len(parts) == 0 {
		return nil
	}
	switch parts[0] {
	case "/help":
		m.AppendMessage("assistant", "Slash commands:\n- /help     — Show help\n- /new      — Clear conversation\n- /undo     — Remove last exchange\n- /models   — List available models\n- /model N  — Switch to model by number\n- /exit     — Quit")
	case "/new":
		m.messages = nil
		m.Display = nil
		m.Refresh()
	case "/undo":
		if len(m.messages) >= 2 {
			m.messages = m.messages[:len(m.messages)-2]
		}
		if len(m.Display) >= 1 {
			m.Display = m.Display[:len(m.Display)-1]
		}
		m.Refresh()
	case "/models":
		var buf strings.Builder
		buf.WriteString("Available text generation models:\n\n")
		for i, mod := range textModels {
			mark := " "
			if mod.ID == m.modelChoice {
				mark = "→"
			}
			buf.WriteString(fmt.Sprintf("  %s %2d. %-30s %s\n", mark, i+1, mod.Name, mod.ID))
		}
		buf.WriteString("\nType /model N to switch (e.g., /model 3)")
		m.AppendMessage("assistant", strings.TrimRight(buf.String(), "\n"))
	case "/model":
		if len(parts) < 2 {
			m.AppendMessage("error", "Usage: /model N (run /models to see available models)")
			return nil
		}
		idx, err := strconv.Atoi(parts[1])
		if err != nil {
			m.AppendMessage("error", "Usage: /model N (run /models to see available models)")
			return nil
		}
		m.switchModel(idx)
	case "/exit":
		return tea.Quit
	default:
		m.AppendMessage("error", "Unknown command: "+cmd+"\nTry /help")
	}
	return nil
}

func (m *codeModel) switchModel(idx int) {
	idx--
	if idx < 0 || idx >= len(textModels) {
		m.AppendMessage("error", "Invalid model number. Run /models to see available models.")
		return
	}
	mod := textModels[idx]
	if mod.ID == m.modelChoice {
		m.AppendMessage("assistant", "Already using `"+mod.ID+"`")
	} else {
		m.modelChoice = mod.ID
		m.AppendMessage("assistant", "Switched to `"+mod.ID+"`")
	}
}

func (m codeModel) View() tea.View {
	label := fmt.Sprintf("Gemini — %s (%s)", modelName(m.modelChoice), m.modelChoice)
	return chat.CommonView(&m.BaseModel, chat.DimText(label), "")
}

func modelName(id string) string {
	for _, mod := range textModels {
		if mod.ID == id {
			return mod.Name
		}
	}
	return id
}
