package requests

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"net"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"
)

func TestBuildURL(t *testing.T) {
	baseUrl := "https://example.com/api"
	query := map[string]string{"foo": "bar", "baz": "123"}

	u, err := buildURL(baseUrl, query)
	if err != nil {
		t.Fatalf("buildURL failed: %v", err)
	}

	if u.Scheme != "https" || u.Host != "example.com" || u.Path != "/api" {
		t.Errorf("URL structure mismatch: %s", u.String())
	}

	q := u.Query()
	if q.Get("foo") != "bar" || q.Get("baz") != "123" {
		t.Errorf("Query parameters mismatch: %s", u.RawQuery)
	}
}

func TestBuildBody(t *testing.T) {
	// 1. Nil body
	r, err := buildBody(nil)
	if err != nil || r != nil {
		t.Errorf("buildBody(nil) expected nil reader, got %v, err: %v", r, err)
	}

	// 2. Map body
	data := map[string]string{"hello": "world"}
	r, err = buildBody(data)
	if err != nil {
		t.Fatalf("buildBody failed: %v", err)
	}

	var decoded map[string]string
	json.NewDecoder(r).Decode(&decoded)
	if decoded["hello"] != "world" {
		t.Errorf("Body content mismatch: %v", decoded)
	}
}

func TestShouldRetry(t *testing.T) {
	tests := []struct {
		err        error
		status     int
		attempt    int
		maxRetries int
		expected   bool
	}{
		{nil, 200, 0, 3, false},
		{nil, 500, 0, 3, true},
		{nil, 500, 3, 3, false},
		{nil, 404, 0, 3, false},
	}

	for _, tt := range tests {
		if res := shouldRetry(tt.err, tt.status, tt.attempt, tt.maxRetries); res != tt.expected {
			t.Errorf("shouldRetry(%v, %d, %d, %d) = %v; expected %v", tt.err, tt.status, tt.attempt, tt.maxRetries, res, tt.expected)
		}
	}
}

func TestRequests(t *testing.T) {
	// Success case
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	}))
	defer ts.Close()

	body, err := Get(ts.URL, Options{})
	if err != nil {
		t.Errorf("Get failed: %v", err)
	}
	if string(body) != "ok" {
		t.Errorf("Unexpected body: %s", string(body))
	}

	// Retry case
	var attempts int
	tsRetry := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		attempts++
		if attempts < 2 {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("recovered"))
	}))
	defer tsRetry.Close()

	body, err = Get(tsRetry.URL, Options{Retries: 2, Timeout: 1 * time.Second})
	if err != nil {
		t.Errorf("Get with retry failed: %v", err)
	}
	if string(body) != "recovered" {
		t.Errorf("Unexpected body after retry: %s", string(body))
	}
	if attempts != 2 {
		t.Errorf("Expected 2 attempts, got %d", attempts)
	}
}

func TestJoinHeaderValues(t *testing.T) {
	tests := []struct {
		name     string
		values   []string
		expected string
	}{
		{"empty", nil, ""},
		{"single", []string{"text/html"}, "text/html"},
		{"multiple", []string{"text/html", "text/plain"}, "text/html, text/plain"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := joinHeaderValues(tt.values); got != tt.expected {
				t.Errorf("joinHeaderValues(%v) = %q; want %q", tt.values, got, tt.expected)
			}
		})
	}
}

func TestBuildURL_EdgeCases(t *testing.T) {
	_, err := buildURL("%zz", nil)
	if err == nil {
		t.Error("expected error for invalid URL")
	}

	u, err := buildURL("https://example.com", nil)
	if err != nil {
		t.Fatalf("buildURL failed: %v", err)
	}
	if u.String() != "https://example.com" {
		t.Errorf("expected https://example.com, got %s", u.String())
	}
}

func TestBuildBody_Unmarshalable(t *testing.T) {
	_, err := buildBody(make(chan int))
	if err == nil {
		t.Error("expected error for unmarshalable body")
	}
}

func TestShouldRetry_NetworkError(t *testing.T) {
	netErr := &net.OpError{Op: "read", Net: "tcp", Err: io.EOF}

	if !shouldRetry(netErr, 0, 0, 3) {
		t.Error("should retry on network error with retries left")
	}
	if shouldRetry(netErr, 0, 3, 3) {
		t.Error("should not retry on network error with no retries left")
	}
}

func TestCreateRequest(t *testing.T) {
	ctx := context.Background()
	u, _ := url.Parse("https://example.com")

	body := strings.NewReader(`{"key":"value"}`)
	opt := Options{
		Header: http.Header{"X-Custom": []string{"val1"}},
		Body:   map[string]string{"key": "value"},
	}
	req, err := createRequest(ctx, http.MethodPost, u, body, opt)
	if err != nil {
		t.Fatalf("createRequest failed: %v", err)
	}
	if req.Header.Get("X-Custom") != "val1" {
		t.Errorf("expected X-Custom=val1, got %s", req.Header.Get("X-Custom"))
	}
	if req.Header.Get(HEADER_CONTENT_TYPE) != CONTENT_TYPE_JSON {
		t.Errorf("expected Content-Type=%s, got %s", CONTENT_TYPE_JSON, req.Header.Get(HEADER_CONTENT_TYPE))
	}

	req2, err := createRequest(ctx, http.MethodGet, u, nil, Options{})
	if err != nil {
		t.Fatalf("createRequest failed: %v", err)
	}
	if req2.Header.Get(HEADER_CONTENT_TYPE) != "" {
		t.Errorf("expected no Content-Type, got %s", req2.Header.Get(HEADER_CONTENT_TYPE))
	}
}

func TestCreateRequest_InvalidMethod(t *testing.T) {
	ctx := context.Background()
	u, _ := url.Parse("https://example.com")
	_, err := createRequest(ctx, "\ninvalid", u, nil, Options{})
	if err == nil {
		t.Error("expected error for invalid method")
	}
}

func TestHandleResponse(t *testing.T) {
	_, _, err := handleResponse(nil)
	if err == nil {
		t.Error("expected error for nil response")
	}

	resp := &http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(strings.NewReader("hello")),
		Header:     make(http.Header),
	}
	body, status, err := handleResponse(resp)
	if err != nil {
		t.Fatalf("handleResponse failed: %v", err)
	}
	if status != http.StatusOK {
		t.Errorf("expected status 200, got %d", status)
	}
	if string(body) != "hello" {
		t.Errorf("expected body 'hello', got %s", string(body))
	}
}

func TestHandleResponse_ReadError(t *testing.T) {
	resp := &http.Response{
		StatusCode: http.StatusInternalServerError,
		Body:       io.NopCloser(&errReader{}),
		Header:     make(http.Header),
	}
	_, _, err := handleResponse(resp)
	if err == nil {
		t.Error("expected error from read failure")
	}
}

type errReader struct{}

func (r errReader) Read(p []byte) (int, error) { return 0, io.ErrUnexpectedEOF }
func (r errReader) Close() error               { return nil }

func TestLogResponse(t *testing.T) {
	var buf bytes.Buffer
	old := log.Writer()
	log.SetOutput(&buf)
	defer log.SetOutput(old)

	logResponse(&http.Response{}, nil, Options{Debug: false})
	if buf.Len() != 0 {
		t.Error("expected no output when Debug=false")
	}

	logResponse(nil, nil, Options{Debug: true})
	if buf.Len() != 0 {
		t.Error("expected no output when resp is nil")
	}

	buf.Reset()
	resp := &http.Response{
		StatusCode: http.StatusOK,
		Status:     "200 OK",
		Header:     http.Header{"Content-Type": []string{"application/json"}},
		Body:       io.NopCloser(strings.NewReader("{}")),
	}
	logResponse(resp, []byte("{}"), Options{Debug: true})
	if buf.Len() == 0 {
		t.Error("expected output when Debug=true")
	}

	buf.Reset()
	longBody := make([]byte, 2000)
	for i := range longBody {
		longBody[i] = 'a'
	}
	logResponse(resp, longBody, Options{Debug: true})
	if buf.Len() == 0 {
		t.Error("expected output for truncated body")
	}
}

func TestHTTPMethods(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		resp := map[string]interface{}{
			"method": r.Method,
			"body":   string(body),
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer ts.Close()

	tests := []struct {
		name   string
		call   func(url string, opts Options) ([]byte, error)
		method string
		body   interface{}
	}{
		{"Post", Post, "POST", map[string]string{"msg": "post"}},
		{"Put", Put, "PUT", map[string]string{"msg": "put"}},
		{"Patch", Patch, "PATCH", map[string]string{"msg": "patch"}},
		{"Delete", Delete, "DELETE", nil},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, err := tt.call(ts.URL, Options{Body: tt.body})
			if err != nil {
				t.Fatalf("%s failed: %v", tt.name, err)
			}
			var result map[string]interface{}
			if err := json.Unmarshal(body, &result); err != nil {
				t.Fatalf("unmarshal failed: %v", err)
			}
			if result["method"] != tt.method {
				t.Errorf("expected method %s, got %v", tt.method, result["method"])
			}
		})
	}
}

func TestGet_InvalidURL(t *testing.T) {
	_, err := Get("://invalid", Options{})
	if err == nil {
		t.Error("expected error for invalid URL")
	}
}

func TestDoRequest_Timeout(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(2 * time.Second)
		w.WriteHeader(http.StatusOK)
	}))
	defer ts.Close()

	_, err := Get(ts.URL, Options{Timeout: 10 * time.Millisecond, Retries: 1})
	if err == nil {
		t.Error("expected timeout error")
	}
}

func TestDoRequest_RetryExhausted(t *testing.T) {
	var attempts int
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		attempts++
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer ts.Close()

	body, err := Get(ts.URL, Options{Retries: 2, Timeout: 1 * time.Second})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(body) != 0 {
		t.Errorf("unexpected body: %s", string(body))
	}
	if attempts != 3 {
		t.Errorf("expected 3 attempts, got %d", attempts)
	}
}
