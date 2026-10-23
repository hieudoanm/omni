package code

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/config"
	or "github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/openrouterlib"
	"github.com/hieudoanm/omni/packages/cli/src/libs/chat"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"
)

const (
	appNormal = iota
	appToolConfirm
	appModelPicker
)

type codeResultMsg struct {
	response map[string]interface{}
	err      error
}

type probeResultMsg struct {
	results []or.ProbeResult
	modelID string
}

var (
	amberClr  = lipgloss.Color("214")
	labelTool = lipgloss.NewStyle().Foreground(amberClr).Bold(true).Render
)

type codeModel struct {
	chat.BaseModel

	messages []map[string]interface{}

	appState int

	pendingToolCalls []map[string]interface{}
	pendingText      string

	modelChoice   string
	models        []or.Model
	modelPickerID string
}

func toolDefinitions() []map[string]interface{} {
	return []map[string]interface{}{
		{
			"type": "function",
			"function": map[string]interface{}{
				"name":        "read_file",
				"description": "Read the contents of a file at the given path",
				"parameters": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"path": map[string]interface{}{"type": "string", "description": "Absolute path to the file"},
					},
					"required": []string{"path"},
				},
			},
		},
		{
			"type": "function",
			"function": map[string]interface{}{
				"name":        "write_file",
				"description": "Write content to a file (creates or overwrites)",
				"parameters": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"path":    map[string]interface{}{"type": "string", "description": "Absolute path to the file"},
						"content": map[string]interface{}{"type": "string", "description": "Full content to write"},
					},
					"required": []string{"path", "content"},
				},
			},
		},
		{
			"type": "function",
			"function": map[string]interface{}{
				"name":        "edit_file",
				"description": "Replace exact text in a file (for surgical edits)",
				"parameters": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"path":       map[string]interface{}{"type": "string", "description": "Absolute path to the file"},
						"old_string": map[string]interface{}{"type": "string", "description": "The exact text to replace"},
						"new_string": map[string]interface{}{"type": "string", "description": "The replacement text"},
					},
					"required": []string{"path", "old_string", "new_string"},
				},
			},
		},
		{
			"type": "function",
			"function": map[string]interface{}{
				"name":        "run_bash",
				"description": "Execute a bash command and return its output",
				"parameters": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"command": map[string]interface{}{"type": "string", "description": "The bash command to run"},
						"workdir": map[string]interface{}{"type": "string", "description": "Working directory (default: current dir)"},
					},
					"required": []string{"command"},
				},
			},
		},
	}
}

func codeInitialModel(model string) codeModel {
	m := codeModel{
		BaseModel:   chat.NewBaseModel("Ask opencode... (@ for files, ! for shell commands)"),
		modelChoice: model,
		messages:    codeInitMessages(),
	}
	m.Refresh()
	return m
}

func codeInitMessages() []map[string]interface{} {
	return []map[string]interface{}{
		{
			"role": "system",
			"content": `You are a coding assistant integrated into the omni CLI toolbox.

You have access to tools that let you read, write, and edit files, and run bash commands.

Rules:
- Always read a file before editing it.
- Use exact string matching for edit_file.
- When the user asks you to make changes, first read the relevant files, then make the edits.
- After making edits, verify the result (e.g. build/test the project).
- Be concise in your responses.`,
		},
	}
}

func (m codeModel) Init() tea.Cmd {
	return nil
}

func (m *codeModel) appendUserMessage(text string) {
	m.messages = append(m.messages, map[string]interface{}{
		"role":    "user",
		"content": text,
	})
	m.AppendMessage("user", text)
}

func sendToAPI(model string, messages []map[string]interface{}, tools []map[string]interface{}) tea.Cmd {
	return func() tea.Msg {
		payload := map[string]interface{}{
			"model":    model,
			"messages": messages,
			"tools":    tools,
		}

		apiKey := config.LoadAPIKey()
		if apiKey == "" {
			return codeResultMsg{err: fmt.Errorf("OpenRouter API key not set")}
		}

		body, err := requests.Post(or.BaseURL+"/chat/completions", requests.Options{
			Body: payload,
			Header: map[string][]string{
				"Authorization": {"Bearer " + apiKey},
				"HTTP-Referer":  {"https://github.com/hieudoanm/omni/packages/cli"},
				"X-Title":       {"omni"},
			},
		})
		if err != nil {
			return codeResultMsg{err: fmt.Errorf("API request: %w", err)}
		}

		var result map[string]interface{}
		if err := json.Unmarshal(body, &result); err != nil {
			return codeResultMsg{err: fmt.Errorf("parse response: %w", err)}
		}

		if errText, ok := result["error"].(map[string]interface{}); ok {
			errJSON, _ := json.MarshalIndent(errText, "", "  ")
			return codeResultMsg{err: fmt.Errorf("API error:\n%s", string(errJSON))}
		}
		if errStr, ok := result["error"].(string); ok {
			fullResp, _ := json.MarshalIndent(result, "", "  ")
			return codeResultMsg{err: fmt.Errorf("API error: %s\nFull response:\n%s", errStr, string(fullResp))}
		}

		return codeResultMsg{response: result}
	}
}

func (m codeModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch m.appState {
	case appToolConfirm:
		return m.handleToolConfirmMsg(msg)
	case appModelPicker:
		return m.handleModelPickerMsg(msg)
	}

	if handled, cmd := m.BaseModel.HandleCommonMsg(msg, func(text string) tea.Cmd {
		m.appendUserMessage(text)
		m.Input.Reset()
		m.State = chat.StateLoading
		return tea.Batch(
			m.Spin.Tick,
			sendToAPI(m.modelChoice, m.messages, toolDefinitions()),
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
	case probeResultMsg:
		var ok, rl, restricted, errs int
		for _, r := range msg.results {
			switch r.Status {
			case or.StatusOK:
				ok++
			case or.StatusRateLimited:
				rl++
			case or.StatusRestricted:
				restricted++
			case or.StatusError:
				errs++
			}
		}
		var buf strings.Builder
		buf.WriteString("Probe results:\n")
		buf.WriteString(fmt.Sprintf("  %d OK  %d rate-limited  %d restricted  %d errors\n\n", ok, rl, restricted, errs))

		for _, r := range msg.results {
			line := fmt.Sprintf("  %s %s", statusIcon(r.Status), r.Model.ID)
			if r.Status == or.StatusOK {
				line += fmt.Sprintf("  %dms", r.Latency)
			}
			line += "  \n"
			buf.WriteString(line)
			if r.Status == or.StatusError && r.Message != "" {
				errMsg := r.Message
				if len(errMsg) > 60 {
					errMsg = errMsg[:57] + "..."
				}
				buf.WriteString(fmt.Sprintf("     %s  \n", errMsg))
			}
		}
		m.AppendMessage("assistant", buf.String())
		return m, nil

	case codeResultMsg:
		if msg.err != nil {
			m.State = chat.StateChat
			m.RecordThought()
			m.AppendMessage("error", msg.err.Error())
			return m, nil
		}
		choice := msg.response["choices"].([]interface{})[0].(map[string]interface{})
		finishReason := choice["finish_reason"].(string)
		assistantMsg := choice["message"].(map[string]interface{})

		m.messages = append(m.messages, assistantMsg)

		if text, ok := assistantMsg["content"].(string); ok && text != "" {
			m.pendingText = text
		}

		if finishReason == "tool_calls" || assistantMsg["tool_calls"] != nil {
			tc := assistantMsg["tool_calls"].([]interface{})
			m.pendingToolCalls = make([]map[string]interface{}, len(tc))
			for i, t := range tc {
				m.pendingToolCalls[i] = t.(map[string]interface{})
			}
			m.State = chat.StateChat
			m.appState = appToolConfirm
			return m, nil
		}

		m.State = chat.StateChat
		m.RecordThought()

		var content string
		if c, ok := assistantMsg["content"].(string); ok {
			content = c
		}
		m.AppendMessage("assistant", content)
		return m, nil
	}

	cmd := m.BaseModel.HandleInputMsg(msg)
	return m, cmd
}

func (m *codeModel) handleToolConfirmMsg(msg tea.Msg) (tea.Model, tea.Cmd) {
	keyMsg, ok := msg.(tea.KeyMsg)
	if !ok {
		return m, nil
	}
	switch keyMsg.String() {
	case "y", "Y":
		var results []map[string]interface{}
		for _, tc := range m.pendingToolCalls {
			fn := tc["function"].(map[string]interface{})
			name := fn["name"].(string)
			var args map[string]interface{}
			json.Unmarshal([]byte(fn["arguments"].(string)), &args)

			var toolOutput string
			switch name {
			case "read_file":
				toolOutput = toolReadFile(args["path"].(string))
			case "write_file":
				toolOutput = toolWriteFile(args["path"].(string), args["content"].(string))
			case "edit_file":
				toolOutput = toolEditFile(args["path"].(string), args["old_string"].(string), args["new_string"].(string))
			case "run_bash":
				workdir, _ := args["workdir"].(string)
				toolOutput = toolRunBash(args["command"].(string), workdir)
			default:
				toolOutput = fmt.Sprintf("unknown tool: %s", name)
			}

			results = append(results, map[string]interface{}{
				"role":         "tool",
				"content":      toolOutput,
				"tool_call_id": tc["id"].(string),
			})
		}

		m.messages = append(m.messages, results...)

		if m.pendingText != "" {
			m.AppendMessage("assistant", m.pendingText)
			m.pendingText = ""
		}

		m.pendingToolCalls = nil
		m.appState = appNormal
		m.State = chat.StateLoading
		return m, tea.Batch(
			m.Spin.Tick,
			sendToAPI(m.modelChoice, m.messages, toolDefinitions()),
		)

	case "n", "N":
		for _, tc := range m.pendingToolCalls {
			m.messages = append(m.messages, map[string]interface{}{
				"role":         "tool",
				"content":      "User declined to run this tool call",
				"tool_call_id": tc["id"].(string),
			})
		}
		if m.pendingText != "" {
			m.AppendMessage("assistant", m.pendingText)
			m.pendingText = ""
		}
		m.pendingToolCalls = nil
		m.appState = appNormal
		m.State = chat.StateLoading
		return m, tea.Batch(
			m.Spin.Tick,
			sendToAPI(m.modelChoice, m.messages, toolDefinitions()),
		)

	case "esc", "ctrl+c":
		return m, tea.Quit
	}
	return m, nil
}

func (m *codeModel) handleModelPickerMsg(msg tea.Msg) (tea.Model, tea.Cmd) {
	keyMsg, ok := msg.(tea.KeyMsg)
	if !ok {
		return m, nil
	}
	switch keyMsg.String() {
	case "enter":
		text := strings.TrimSpace(m.Input.Value())
		m.Input.Reset()
		var idx int
		if n, _ := fmt.Sscanf(text, "%d", &idx); n == 1 {
			m.switchModel(idx)
		} else {
			m.AppendMessage("error", "Enter a number from the model list above.")
		}
		return m, nil
	case "esc":
		m.appState = appNormal
		m.State = chat.StateChat
		m.Input.Reset()
		return m, nil
	}

	var cmd tea.Cmd
	m.Input, cmd = m.Input.Update(msg)
	return m, cmd
}

func (m *codeModel) handleSlash(cmd string) tea.Cmd {
	parts := strings.Fields(cmd)
	base := parts[0]

	switch base {
	case "/help":
		m.AppendMessage("assistant", "Slash commands:\n- /help     - Show help\n- /models   - List available models\n- /model N  - Switch to model by number\n- /probe    - Probe models for availability\n- /new      - Clear conversation\n- /undo     - Remove last exchange\n- /exit     - Quit")
	case "/models":
		models, err := or.FetchFreeModels()
		if err != nil {
			m.AppendMessage("error", "Failed to fetch models: "+err.Error())
			return nil
		}
		m.models = models
		var buf strings.Builder
		buf.WriteString("Available free models:\n\n")
		for i, mod := range models {
			mark := " "
			if mod.ID == m.modelChoice {
				mark = ">"
			}
			buf.WriteString(fmt.Sprintf("  %s %2d. %s\n", mark, i+1, mod.ID))
		}
		buf.WriteString(fmt.Sprintf("\nTotal: %d models\n", len(models)))
		buf.WriteString("\nType /model N to switch, or /probe to check availability.")
		m.AppendMessage("assistant", strings.TrimRight(buf.String(), "\n"))
		m.appState = appModelPicker
	case "/probe":
		apiKey := config.LoadAPIKey()
		if apiKey == "" {
			m.AppendMessage("error", "API key not set")
			return nil
		}
		freeModels, err := or.FetchFreeModels()
		if err != nil {
			m.AppendMessage("error", "Failed to fetch models: "+err.Error())
			return nil
		}
		m.AppendMessage("assistant", "Probing models for availability... (this may take a moment)")
		return sendProbe(freeModels, apiKey)
	case "/model":
		if len(parts) < 2 {
			m.AppendMessage("error", "Usage: /model N  (run /models first to see available models)")
			return nil
		}
		var idx int
		if n, err := fmt.Sscanf(parts[1], "%d", &idx); err != nil || n != 1 {
			m.AppendMessage("error", "Usage: /model N  (N is a number)\nRun /models to see available models")
			return nil
		}
		m.switchModel(idx)
	case "/new":
		m.messages = codeInitMessages()
		m.Display = nil
		m.Refresh()
	case "/undo":
		if len(m.messages) >= 4 {
			m.messages = m.messages[:len(m.messages)-2]
		}
		if len(m.Display) >= 1 {
			m.Display = m.Display[:len(m.Display)-1]
		}
		m.Refresh()
	case "/exit":
		return tea.Quit
	default:
		m.AppendMessage("error", "Unknown command: "+cmd+"\nTry /help")
	}
	return nil
}

func (m codeModel) View() tea.View {
	var extraBody string
	if m.appState == appToolConfirm {
		extraBody = formatToolConfirm(m.pendingToolCalls)
	}
	modelName := chat.DimText("OpenRouter - " + m.modelChoice)
	return chat.CommonView(&m.BaseModel, modelName, extraBody)
}

func formatToolConfirm(calls []map[string]interface{}) string {
	var buf strings.Builder
	padded := lipgloss.NewStyle().PaddingLeft(2)
	buf.WriteString(padded.Render(labelTool("TOOL")) + "\n")
	for i, tc := range calls {
		fn := tc["function"].(map[string]interface{})
		var args map[string]interface{}
		json.Unmarshal([]byte(fn["arguments"].(string)), &args)
		toolLine := fmt.Sprintf("  %d. %s(", i+1, fn["name"])
		first := true
		for k, v := range args {
			if !first {
				toolLine += ", "
			}
			argStr, _ := json.Marshal(v)
			toolLine += fmt.Sprintf("%s=%s", k, string(argStr))
			first = false
		}
		toolLine += ")"
		buf.WriteString(padded.Render(chat.DimText(toolLine)) + "\n")
	}
	buf.WriteString("\n" + padded.Render(chat.LabelAsst("Approve? (y/n)")))
	return buf.String()
}

func sendProbe(models []or.Model, apiKey string) tea.Cmd {
	return func() tea.Msg {
		return probeResultMsg{
			results: probeModels(models, apiKey),
		}
	}
}

func (m *codeModel) switchModel(idx int) {
	idx--
	if idx < 0 || idx >= len(m.models) {
		m.AppendMessage("error", "Invalid model number. Run /models to see available models.")
		m.State = chat.StateChat
		m.appState = appNormal
		return
	}
	newModel := m.models[idx].ID
	if newModel == m.modelChoice {
		m.AppendMessage("assistant", "Already using `"+newModel+"`")
	} else {
		m.modelChoice = newModel
		m.AppendMessage("assistant", "Switched to `"+newModel+"`")
	}
	m.State = chat.StateChat
	m.appState = appNormal
}

func toolReadFile(path string) string {
	if !filepath.IsAbs(path) {
		wd, _ := os.Getwd()
		path = filepath.Join(wd, path)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Sprintf("Error: %v", err)
	}
	return string(data)
}

func toolWriteFile(path, content string) string {
	if !filepath.IsAbs(path) {
		wd, _ := os.Getwd()
		path = filepath.Join(wd, path)
	}
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return fmt.Sprintf("Error creating directory: %v", err)
	}
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		return fmt.Sprintf("Error: %v", err)
	}
	return fmt.Sprintf("Written %d bytes to %s", len(content), path)
}

func toolEditFile(path, oldStr, newStr string) string {
	if !filepath.IsAbs(path) {
		wd, _ := os.Getwd()
		path = filepath.Join(wd, path)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Sprintf("Error: %v", err)
	}
	content := string(data)
	if !strings.Contains(content, oldStr) {
		return fmt.Sprintf("Error: string not found in %s", path)
	}
	content = strings.Replace(content, oldStr, newStr, 1)
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		return fmt.Sprintf("Error: %v", err)
	}
	return fmt.Sprintf("Edited %s (replaced one occurrence)", path)
}

func toolRunBash(command, workdir string) string {
	cmd := exec.Command("bash", "-c", command)
	if workdir != "" {
		cmd.Dir = workdir
	}
	cmd.Env = os.Environ()

	timeout := 30 * time.Second
	done := make(chan struct{})
	var output []byte
	var err error

	go func() {
		output, err = cmd.CombinedOutput()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(timeout):
		cmd.Process.Kill()
		return fmt.Sprintf("Error: command timed out after %v", timeout)
	}

	outStr := string(output)
	if outStr == "" && err != nil {
		return fmt.Sprintf("Error: %v", err)
	}
	if outStr == "" {
		return "Command completed (no output)"
	}
	if len(outStr) > 5000 {
		outStr = outStr[:5000] + "\n...[truncated]"
	}
	return outStr
}

func pickToolModel() string {
	apiKey := config.LoadAPIKey()
	if apiKey == "" {
		return "google/gemma-4-26b-a4b-it:free"
	}
	models, err := or.FetchFreeModels()
	if err != nil || len(models) == 0 {
		return "google/gemma-4-26b-a4b-it:free"
	}

	toolPatterns := []string{"gemma-4", "llama-3.2", "mistral"}
	var candidates []or.Model
	for _, p := range toolPatterns {
		for _, m := range models {
			if strings.Contains(strings.ToLower(m.ID), p) {
				candidates = append(candidates, m)
			}
		}
	}
	if len(candidates) == 0 {
		candidates = models[:min(10, len(models))]
	}

	results := probeModels(candidates, apiKey)
	for _, r := range results {
		if r.Status == or.StatusOK {
			return r.Model.ID
		}
	}

	if len(models) > 0 {
		return models[0].ID
	}
	return "google/gemma-4-26b-a4b-it:free"
}

func probeModels(models []or.Model, apiKey string) []or.ProbeResult {
	results := make([]or.ProbeResult, len(models))
	var mu sync.Mutex
	var wg sync.WaitGroup
	var idx int

	jobs := make(chan or.Model, len(models))
	for _, m := range models {
		jobs <- m
	}
	close(jobs)

	httpClient := &http.Client{Timeout: 5 * time.Second}
	workers := 6
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for m := range jobs {
				r := quickProbeModel(m, apiKey, httpClient)
				mu.Lock()
				results[idx] = r
				idx++
				mu.Unlock()
			}
		}()
	}
	wg.Wait()

	sort.Slice(results, func(i, j int) bool {
		if results[i].Status != results[j].Status {
			return results[i].Status < results[j].Status
		}
		if results[i].Status == or.StatusOK {
			return results[i].Latency < results[j].Latency
		}
		return results[i].Model.ID < results[j].Model.ID
	})
	return results
}

func quickProbeModel(m or.Model, apiKey string, client *http.Client) or.ProbeResult {
	payload := map[string]any{
		"model": m.ID,
		"messages": []map[string]any{
			{"role": "user", "content": "hi"},
		},
		"max_tokens": 1,
		"provider": map[string]any{
			"allow_fallbacks": false,
			"data_collection": "allow",
		},
	}
	body, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, or.BaseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return or.ProbeResult{Model: m, Status: or.StatusError, Message: err.Error()}
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("HTTP-Referer", "https://github.com/hieudoanm/hieudoanm")
	req.Header.Set("X-Title", "omni")

	start := time.Now()
	resp, err := client.Do(req)
	elapsed := time.Since(start).Milliseconds()
	if err != nil {
		return or.ProbeResult{Model: m, Status: or.StatusError, Message: err.Error()}
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)

	switch resp.StatusCode {
	case http.StatusOK:
		return or.ProbeResult{Model: m, Status: or.StatusOK, Latency: elapsed}
	case http.StatusTooManyRequests:
		return or.ProbeResult{Model: m, Status: or.StatusRateLimited, Message: or.ExtractMessage(raw)}
	case http.StatusNotFound:
		return or.ProbeResult{Model: m, Status: or.StatusRestricted, Message: or.ExtractMessage(raw)}
	default:
		msg := or.ExtractMessage(raw)
		if msg == "" {
			msg = fmt.Sprintf("HTTP %d", resp.StatusCode)
		}
		return or.ProbeResult{Model: m, Status: or.StatusError, Message: msg}
	}
}

func statusIcon(s or.ProbeStatus) string {
	switch s {
	case or.StatusOK:
		return "OK"
	case or.StatusRateLimited:
		return "RL"
	case or.StatusRestricted:
		return "RE"
	case or.StatusError:
		return "ER"
	default:
		return "?"
	}
}
