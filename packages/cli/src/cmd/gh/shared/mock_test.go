package shared

import (
	"errors"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

var testOpts = requests.Options{}

func TestMockFetchSeq_single(t *testing.T) {
	fn := MockFetchSeq(MockResult{Body: []byte("hello"), Err: nil})
	body, err := fn("https://example.com", testOpts)
	if err != nil {
		t.Fatal(err)
	}
	if string(body) != "hello" {
		t.Errorf("got %q, want %q", string(body), "hello")
	}
}

func TestMockFetchSeq_multiple(t *testing.T) {
	fn := MockFetchSeq(
		MockResult{Body: []byte("first"), Err: nil},
		MockResult{Body: []byte("second"), Err: nil},
	)
	body1, _ := fn("https://example.com", testOpts)
	if string(body1) != "first" {
		t.Errorf("first call: got %q, want %q", string(body1), "first")
	}
	body2, _ := fn("https://example.com", testOpts)
	if string(body2) != "second" {
		t.Errorf("second call: got %q, want %q", string(body2), "second")
	}
}

func TestMockFetchSeq_exhausted(t *testing.T) {
	fn := MockFetchSeq(MockResult{Body: []byte("only"), Err: nil})
	fn("https://example.com", testOpts)
	body, err := fn("https://example.com", testOpts)
	if string(body) != "" || err != nil {
		t.Errorf("expected (nil, nil) after exhaustion, got (%q, %v)", string(body), err)
	}
}

func TestMockFetchSeq_error(t *testing.T) {
	fn := MockFetchSeq(MockResult{Body: nil, Err: errors.New("network error")})
	_, err := fn("https://example.com", testOpts)
	if err == nil || err.Error() != "network error" {
		t.Errorf("expected 'network error', got %v", err)
	}
}

func TestMockFetchSeq_empty(t *testing.T) {
	fn := MockFetchSeq()
	body, err := fn("https://example.com", testOpts)
	if string(body) != "" || err != nil {
		t.Errorf("expected (nil, nil) for empty seq, got (%q, %v)", string(body), err)
	}
}
