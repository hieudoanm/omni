package mcp

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"os"
	"strings"
	"testing"
	"time"
)

type errorReader struct {
	err error
}

func (r *errorReader) Read(p []byte) (int, error) {
	return 0, r.err
}

func TestNewServer(t *testing.T) {
	s := NewServer()
	if s == nil {
		t.Fatal("NewServer returned nil")
	}
	if len(s.tools) != 0 {
		t.Errorf("expected empty tools, got %d", len(s.tools))
	}
}

func TestAddTool(t *testing.T) {
	s := NewServer()
	tool := Tool{
		Name:        "test_tool",
		Description: "a test tool",
		InputSchema: Schema{Type: "object", Properties: map[string]PropertySchema{}},
	}
	s.AddTool(tool, func(args json.RawMessage) *ToolResult {
		return NewToolResultText("ok")
	})

	if len(s.tools) != 1 {
		t.Fatalf("expected 1 tool, got %d", len(s.tools))
	}
	if s.tools["test_tool"].Name != "test_tool" {
		t.Errorf("expected tool name 'test_tool', got %q", s.tools["test_tool"].Name)
	}
	if s.handlers["test_tool"] == nil {
		t.Error("expected handler to be registered")
	}
}

func TestNewErrorResponse(t *testing.T) {
	id := json.RawMessage(`1`)
	resp := NewErrorResponse(id, ErrCodeParse, "parse error")
	if resp.JSONRPC != "2.0" {
		t.Errorf("expected JSONRPC 2.0, got %q", resp.JSONRPC)
	}
	if string(resp.ID) != `1` {
		t.Errorf("expected ID 1, got %q", string(resp.ID))
	}
	if resp.Error == nil {
		t.Fatal("expected non-nil Error")
	}
	if resp.Error.Code != ErrCodeParse {
		t.Errorf("expected code %d, got %d", ErrCodeParse, resp.Error.Code)
	}
	if resp.Error.Message != "parse error" {
		t.Errorf("expected message 'parse error', got %q", resp.Error.Message)
	}
	if resp.Result != nil {
		t.Error("expected nil Result in error response")
	}
}

func TestNewSuccessResponse(t *testing.T) {
	id := json.RawMessage(`2`)
	result := map[string]string{"status": "ok"}
	resp := NewSuccessResponse(id, result)
	if resp.JSONRPC != "2.0" {
		t.Errorf("expected JSONRPC 2.0, got %q", resp.JSONRPC)
	}
	if string(resp.ID) != `2` {
		t.Errorf("expected ID 2, got %q", string(resp.ID))
	}
	if resp.Error != nil {
		t.Error("expected nil Error in success response")
	}
	r, ok := resp.Result.(map[string]string)
	if !ok || r["status"] != "ok" {
		t.Errorf("expected result map, got %v", resp.Result)
	}
}

func TestNewToolResultText(t *testing.T) {
	tr := NewToolResultText("hello world")
	if tr.IsError {
		t.Error("expected IsError to be false for text result")
	}
	if len(tr.Content) != 1 {
		t.Fatalf("expected 1 content item, got %d", len(tr.Content))
	}
	if tr.Content[0].Type != "text" {
		t.Errorf("expected type 'text', got %q", tr.Content[0].Type)
	}
	if tr.Content[0].Text != "hello world" {
		t.Errorf("expected text 'hello world', got %q", tr.Content[0].Text)
	}
}

func TestNewToolResultError(t *testing.T) {
	tr := NewToolResultError("something went wrong")
	if !tr.IsError {
		t.Error("expected IsError to be true for error result")
	}
	if len(tr.Content) != 1 {
		t.Fatalf("expected 1 content item, got %d", len(tr.Content))
	}
	if tr.Content[0].Text != "something went wrong" {
		t.Errorf("expected text 'something went wrong', got %q", tr.Content[0].Text)
	}
}

func runServerOnPipe(t *testing.T, messages string) string {
	t.Helper()

	reader := strings.NewReader(messages)
	var stdout bytes.Buffer

	s := NewServer()
	s.AddTool(Tool{
		Name:        "echo",
		Description: "echoes input",
		InputSchema: Schema{Type: "object", Properties: map[string]PropertySchema{
			"text": {Type: "string"},
		}},
	}, func(args json.RawMessage) *ToolResult {
		var p struct {
			Text string `json:"text"`
		}
		json.Unmarshal(args, &p)
		return NewToolResultText(p.Text)
	})

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	ctx, cancel := context.WithCancel(context.Background())

	go func() {
		s.runWithReader(ctx, reader)
		w.Close()
	}()

	io.Copy(&stdout, r)
	cancel()
	os.Stdout = oldStdout

	return stdout.String()
}

func TestServerInitialize(t *testing.T) {
	output := runServerOnPipe(t, `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","clientInfo":{"name":"test","version":"1.0.0"}}}`+"\n")

	if !strings.Contains(output, `"jsonrpc":"2.0"`) {
		t.Fatal("response missing jsonrpc field")
	}
	if !strings.Contains(output, `"protocolVersion":"2025-11-25"`) {
		t.Fatal("response missing protocolVersion")
	}
	if !strings.Contains(output, `"serverInfo"`) {
		t.Fatal("response missing serverInfo")
	}
}

func TestServerPing(t *testing.T) {
	output := runServerOnPipe(t, `{"jsonrpc":"2.0","id":1,"method":"ping"}`+"\n")

	if !strings.Contains(output, `"jsonrpc":"2.0"`) {
		t.Fatal("response missing jsonrpc field")
	}
}

func TestServerToolsList(t *testing.T) {
	output := runServerOnPipe(t, `{"jsonrpc":"2.0","id":1,"method":"tools/list"}`+"\n")

	if !strings.Contains(output, `"tools":[`) && !strings.Contains(output, `"tools"`) {
		t.Fatal("response missing tools list")
	}
}

func TestServerToolsCall(t *testing.T) {
	output := runServerOnPipe(t, `{"jsonrpc":"2.0","id":1,"method":"tools/list"}`+"\n")

	if !strings.Contains(output, `"jsonrpc":"2.0"`) {
		t.Fatal("response missing jsonrpc")
	}
}

func TestServerCallTool(t *testing.T) {
	output := runServerOnPipe(t, `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"echo","arguments":{"text":"hello"}}}`+"\n")

	if !strings.Contains(output, `"text":"hello"`) {
		t.Fatalf("expected echo response with 'hello', got: %s", output)
	}
}

func TestServerCallToolNotFound(t *testing.T) {
	output := runServerOnPipe(t, `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"nonexistent","arguments":{}}}`+"\n")

	if !strings.Contains(output, `"error"`) {
		t.Fatalf("expected error response, got: %s", output)
	}
}

func TestServerBadJSON(t *testing.T) {
	output := runServerOnPipe(t, `not json`+"\n")

	if !strings.Contains(output, `"error"`) {
		t.Fatalf("expected error response for bad JSON, got: %s", output)
	}
}

func TestServerWrongVersion(t *testing.T) {
	output := runServerOnPipe(t, `{"jsonrpc":"1.0","id":1,"method":"ping"}`+"\n")

	if !strings.Contains(output, `"error"`) {
		t.Fatalf("expected error response for wrong version, got: %s", output)
	}
}

func TestServerUnknownMethod(t *testing.T) {
	output := runServerOnPipe(t, `{"jsonrpc":"2.0","id":1,"method":"unknown"}`+"\n")

	if !strings.Contains(output, `"error"`) {
		t.Fatalf("expected error response for unknown method, got: %s", output)
	}
}

func TestServerEmptyLine(t *testing.T) {
	output := runServerOnPipe(t, "\n"+`{"jsonrpc":"2.0","id":1,"method":"ping"}`+"\n")

	if !strings.Contains(output, `"jsonrpc":"2.0"`) {
		t.Fatal("response missing jsonrpc field after empty line")
	}
}

func TestServerMultipleMessages(t *testing.T) {
	msg := `{"jsonrpc":"2.0","id":1,"method":"ping"}` + "\n" +
		`{"jsonrpc":"2.0","id":2,"method":"ping"}` + "\n"

	output := runServerOnPipe(t, msg)

	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) < 2 {
		t.Fatalf("expected at least 2 response lines, got %d: %s", len(lines), output)
	}
}

func TestWrite(t *testing.T) {
	s := NewServer()
	resp := NewSuccessResponse(json.RawMessage(`1`), map[string]interface{}{"status": "ok"})

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	s.write(resp)

	w.Close()
	var buf bytes.Buffer
	io.Copy(&buf, r)
	os.Stdout = old

	var response Response
	if err := json.Unmarshal(bytes.TrimSpace(buf.Bytes()), &response); err != nil {
		t.Fatalf("invalid JSON response: %v", err)
	}
	if response.Error != nil {
		t.Errorf("expected no error, got %v", response.Error)
	}
}

func TestWriteMarshalError(t *testing.T) {
	s := NewServer()
	resp := Response{
		JSONRPC: "2.0",
		ID:      json.RawMessage(`1`),
		Result:  map[string]interface{}{"ch": make(chan int)},
	}

	var logBuf bytes.Buffer
	log.SetOutput(&logBuf)
	defer log.SetOutput(os.Stderr)

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	s.write(resp)

	w.Close()
	io.Copy(io.Discard, r)
	os.Stdout = old

	if !strings.Contains(logBuf.String(), "error marshaling") {
		t.Errorf("expected marshal error log, got: %s", logBuf.String())
	}
}

func TestRun(t *testing.T) {
	msg := `{"jsonrpc":"2.0","id":1,"method":"ping"}` + "\n"

	oldStdin := os.Stdin
	oldStdout := os.Stdout
	inR, inW, _ := os.Pipe()
	outR, outW, _ := os.Pipe()

	inW.Write([]byte(msg))
	inW.Close()
	os.Stdin = inR
	os.Stdout = outW

	s := NewServer()

	errCh := make(chan error, 1)
	go func() {
		errCh <- s.Run()
	}()

	select {
	case err := <-errCh:
		if err != nil {
			t.Errorf("Run() returned error: %v", err)
		}
	case <-time.After(time.Second):
		t.Fatal("Run() timed out")
	}

	outW.Close()
	io.Copy(io.Discard, outR)
	os.Stdin = oldStdin
	os.Stdout = oldStdout
}

func TestRunWithContextCancelled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	s := NewServer()
	err := s.RunWithContext(ctx)
	if err != context.Canceled {
		t.Errorf("expected context.Canceled, got %v", err)
	}
}

func TestRunWithReaderReadError(t *testing.T) {
	ctx := context.Background()
	s := NewServer()

	err := s.runWithReader(ctx, &errorReader{err: io.ErrUnexpectedEOF})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if !strings.Contains(err.Error(), "read stdin") {
		t.Errorf("expected 'read stdin' in error, got %v", err)
	}
}

func TestRunWithReaderCancelDuringRead(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	s := NewServer()

	pr, pw := io.Pipe()
	go func() {
		time.Sleep(10 * time.Millisecond)
		cancel()
		pw.Close()
	}()

	err := s.runWithReader(ctx, pr)
	if err != context.Canceled {
		t.Errorf("expected context.Canceled, got %v", err)
	}
}

func TestHandleCallToolInvalidParams(t *testing.T) {
	var logBuf bytes.Buffer
	log.SetOutput(&logBuf)
	defer log.SetOutput(os.Stderr)

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	s := NewServer()
	id := json.RawMessage(`1`)
	params := json.RawMessage(`42`)
	s.handleCallTool(id, params)

	w.Close()
	var buf bytes.Buffer
	io.Copy(&buf, r)
	os.Stdout = old

	var resp Response
	if err := json.Unmarshal(bytes.TrimSpace(buf.Bytes()), &resp); err != nil {
		t.Fatalf("invalid JSON response: %v", err)
	}
	if resp.Error == nil {
		t.Fatal("expected error response")
	}
	if resp.Error.Code != ErrCodeInvalidParams {
		t.Errorf("expected code %d, got %d", ErrCodeInvalidParams, resp.Error.Code)
	}
}

func TestInitializeResultFields(t *testing.T) {
	output := runServerOnPipe(t, `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","clientInfo":{"name":"test","version":"1.0.0"}}}`+"\n")

	var resp Response
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	resultBytes, err := json.Marshal(resp.Result)
	if err != nil {
		t.Fatalf("failed to marshal result: %v", err)
	}

	var initResult InitializeResult
	if err := json.Unmarshal(resultBytes, &initResult); err != nil {
		t.Fatalf("failed to unmarshal initialize result: %v", err)
	}

	if initResult.ProtocolVersion != "2025-11-25" {
		t.Errorf("expected protocol version 2025-11-25, got %q", initResult.ProtocolVersion)
	}
	if initResult.ServerInfo.Name != "omni-mcp" {
		t.Errorf("expected server name omni-mcp, got %q", initResult.ServerInfo.Name)
	}
	if initResult.Capabilities.Tools == nil {
		t.Error("expected tools capability")
	}
}
