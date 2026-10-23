package http

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/net/internal"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

func captureOutput(f func()) string {
	return internal.CaptureOutput(f)
}

func TestHTTPRun_InvalidMethod(t *testing.T) {
	err := httpRun("https://example.com", "INVALID", `{"test":"value"}`, "Content-Type: application/json,Authorization: Bearer xyz", false)
	if err == nil {
		t.Fatal("expected error for invalid method")
	}
	if !strings.Contains(err.Error(), "unsupported method") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestHTTPRun_GET(t *testing.T) {
	saved := httpGet
	defer func() { httpGet = saved }()
	httpGet = func(url string, opts requests.Options) ([]byte, error) {
		return []byte(`{"message":"ok"}`), nil
	}

	out := captureOutput(func() {
		err := httpRun("https://example.com/api", "GET", "", "", false)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "ok") {
		t.Errorf("output missing 'ok': %s", out)
	}
}

func TestHTTPRun_POST(t *testing.T) {
	saved := httpPost
	defer func() { httpPost = saved }()
	httpPost = func(url string, opts requests.Options) ([]byte, error) {
		return []byte(`{"id":1}`), nil
	}

	out := captureOutput(func() {
		err := httpRun("https://example.com/api", "POST", `{"name":"test"}`, "Content-Type: application/json", false)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "1") {
		t.Errorf("output missing '1': %s", out)
	}
}

func TestHTTPRun_PUT(t *testing.T) {
	saved := httpPut
	defer func() { httpPut = saved }()
	httpPut = func(url string, opts requests.Options) ([]byte, error) {
		return []byte(`{"updated":true}`), nil
	}

	out := captureOutput(func() {
		err := httpRun("https://example.com/api/1", "PUT", `{"name":"updated"}`, "", false)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "true") {
		t.Errorf("output missing 'true': %s", out)
	}
}

func TestHTTPRun_DELETE(t *testing.T) {
	saved := httpDelete
	defer func() { httpDelete = saved }()
	httpDelete = func(url string, opts requests.Options) ([]byte, error) {
		return []byte(`{}`), nil
	}

	err := httpRun("https://example.com/api/1", "DELETE", "", "", false)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestHTTPRun_JSONPretty(t *testing.T) {
	saved := httpGet
	defer func() { httpGet = saved }()
	httpGet = func(url string, opts requests.Options) ([]byte, error) {
		return []byte(`{"key":"value","nested":{"a":1}}`), nil
	}

	out := captureOutput(func() {
		err := httpRun("https://example.com/api", "GET", "", "", true)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "nested") {
		t.Errorf("output missing nested: %s", out)
	}
}
