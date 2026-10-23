package requests

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/libs/colors"
)

// ------------------------
// Header Keys (common request headers)
// ------------------------
const (
	HEADER_CONTENT_TYPE     = "Content-Type"     // Format of the request body
	HEADER_ACCEPT           = "Accept"           // Format the client expects in the response
	HEADER_AUTHORIZATION    = "Authorization"    // Bearer/Basic/API key tokens
	HEADER_USER_AGENT       = "User-Agent"       // Identifies the client application
	HEADER_CACHE_CONTROL    = "Cache-Control"    // Controls caching behavior
	HEADER_CONTENT_LENGTH   = "Content-Length"   // Size of the request body (usually auto-set)
	HEADER_CONTENT_ENCODING = "Content-Encoding" // Encoding such as gzip/deflate
	HEADER_ACCEPT_ENCODING  = "Accept-Encoding"  // What encodings the client can accept
	HEADER_ACCEPT_LANGUAGE  = "Accept-Language"  // Preferred language for the response
)

// ------------------------
// MIME / Content-Type Values
// ------------------------
const (
	CONTENT_TYPE_JSON            = "application/json"
	CONTENT_TYPE_XML             = "application/xml"
	CONTENT_TYPE_FORM_URLENCODED = "application/x-www-form-urlencoded"
	CONTENT_TYPE_TEXT_PLAIN      = "text/plain"
	CONTENT_TYPE_TEXT_HTML       = "text/html"
	CONTENT_TYPE_MULTIPART_FORM  = "multipart/form-data"
)

// ------------------------
// Log Labels – used for debug printing
// ------------------------
const (
	LOG_RESPONSE_STATUS = "Response Status"
	LOG_RESPONSE_BODY   = "Response Body"
)

// Default HTTP client with timeout.
// Users can replace this by overriding directly if needed.
var client = &http.Client{Timeout: 15 * time.Second}

// Options configures request behavior: headers, query params,
// body payload, timeout per request, and retry behavior.
type Options struct {
	Header  http.Header
	Query   map[string]string
	Body    interface{}
	Timeout time.Duration
	Retries int
	Debug   bool
}

// ------------------------
// Small helper functions
// ------------------------

// buildURL adds query parameters to a base URL.
// Returns a parsed *url.URL or an error.
func buildURL(rawURL string, query map[string]string) (*url.URL, error) {
	u, err := url.Parse(rawURL)
	if err != nil {
		return nil, err
	}
	if query != nil {
		q := u.Query()
		for k, v := range query {
			q.Set(k, v)
		}
		u.RawQuery = q.Encode()
	}
	return u, nil
}

// buildBody marshals the request body into JSON if non-nil.
// Returns an io.Reader or nil if no body.
func buildBody(body interface{}) (io.Reader, error) {
	if body == nil {
		return nil, nil
	}
	jsonBytes, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	return bytes.NewBuffer(jsonBytes), nil
}

// createRequest prepares the *http.Request with context, URL, body,
// and attaches all provided headers.
func createRequest(ctx context.Context, method string, u *url.URL, body io.Reader, opt Options) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, u.String(), body)
	if err != nil {
		return nil, err
	}

	// Copy custom headers
	for k, values := range opt.Header {
		for _, v := range values {
			req.Header.Add(k, v)
		}
	}

	// Automatically set JSON Content-Type if body is present
	if opt.Body != nil {
		req.Header.Set(HEADER_CONTENT_TYPE, CONTENT_TYPE_JSON)
	}

	return req, nil
}

// shouldRetry determines whether a request should be retried.
// Retries happen on:
// - network errors
// - HTTP 5xx server errors
// - only if attempts < maxRetries
func shouldRetry(err error, status int, attempt, maxRetries int) bool {
	if attempt >= maxRetries {
		return false
	}

	// Retry network errors (connection reset, timeout, etc.)
	if err != nil {
		var netErr net.Error
		return errors.As(err, &netErr)
	}

	// Retry 5xx errors
	return status >= 500 && status <= 599
}

// backoff waits before trying the next retry attempt.
func backoff(attempt int) {
	time.Sleep(time.Duration(attempt+1) * 300 * time.Millisecond)
}

// ------------------------
// Main request functions
// ------------------------

// handleResponse reads the response body safely and returns the body bytes
// and status code. Ensures resp.Body is always closed.
func handleResponse(resp *http.Response) ([]byte, int, error) {
	if resp == nil {
		return nil, 0, errors.New("nil response")
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, err
	}

	return body, resp.StatusCode, nil
}

// attemptRequest builds the URL, encodes the body, creates the request,
// and executes it using the shared HTTP client.
func attemptRequest(
	method string,
	rawURL string,
	options Options,
	ctx context.Context,
) (*http.Response, error) {

	urlObj, err := buildURL(rawURL, options.Query)
	if err != nil {
		return nil, err
	}

	body, err := buildBody(options.Body)
	if err != nil {
		return nil, err
	}

	req, err := createRequest(ctx, method, urlObj, body, options)
	if err != nil {
		return nil, err
	}

	return client.Do(req)
}

// joinHeaderValues joins multiple header values into a single string
func joinHeaderValues(values []string) string {
	if len(values) == 0 {
		return ""
	}
	return values[0] + func() string {
		if len(values) > 1 {
			return ", " + joinHeaderValues(values[1:])
		}
		return ""
	}()
}

// logResponse prints request/response debug info with colors
func logResponse(resp *http.Response, body []byte, options Options) {
	if !options.Debug || resp == nil {
		return
	}

	// Limit body output
	const maxBodyLength = 1000
	bodyStr := string(body)
	if len(bodyStr) > maxBodyLength {
		bodyStr = bodyStr[:maxBodyLength] + "...[truncated]"
	}

	// Format headers
	var headersBuf bytes.Buffer
	for k, v := range resp.Header {
		headersBuf.WriteString(colors.Cyan(k) + ": " + joinHeaderValues(v) + "; ")
	}

	// Color status based on code
	statusColor := colors.Green
	if resp.StatusCode >= 400 && resp.StatusCode < 500 {
		statusColor = colors.Yellow
	} else if resp.StatusCode >= 500 {
		statusColor = colors.Red
	}

	log.Println(colors.Blue("===== HTTP Response Debug ====="))
	log.Printf("Status: %s\n", statusColor(resp.Status))
	log.Printf("Headers: %s\n", headersBuf.String())
	log.Printf("Body: %s\n", colors.Gray(bodyStr))
	log.Println(colors.Blue("==============================="))
}

// doRequest performs the full request cycle including:
// - timeout control
// - retry logic
// - response handling
// - logging (status + body)
func doRequest(method, rawURL string, options Options) ([]byte, error) {
	maxRetries := options.Retries

	// Default timeout if not provided
	timeout := options.Timeout
	if timeout == 0 {
		timeout = 10 * time.Second
	}

	var lastErr error

	for attempt := 0; attempt <= maxRetries; attempt++ {

		// Each attempt gets its own context with timeout
		ctx, cancel := context.WithTimeout(context.Background(), timeout)

		resp, err := attemptRequest(method, rawURL, options, ctx)
		cancel()

		// Network error or connection failure
		if err != nil {
			lastErr = err

			if shouldRetry(err, 0, attempt, maxRetries) {
				backoff(attempt)
				continue
			}
			return nil, err
		}

		// Read and process the response
		body, status, readErr := handleResponse(resp)
		if readErr != nil {
			return nil, readErr
		}

		// Retry server failures (HTTP 5xx)
		if shouldRetry(nil, status, attempt, maxRetries) {
			lastErr = fmt.Errorf("server error: %v", resp.Status)
			backoff(attempt)
			continue
		}

		// Debug logging
		logResponse(resp, body, options)

		return body, nil
	}

	return nil, fmt.Errorf("request failed after retries: %w", lastErr)
}

// Public convenience wrappers for common HTTP verbs
func Get(url string, options Options) ([]byte, error) { return doRequest(http.MethodGet, url, options) }
func Post(url string, options Options) ([]byte, error) {
	return doRequest(http.MethodPost, url, options)
}
func Put(url string, options Options) ([]byte, error) { return doRequest(http.MethodPut, url, options) }
func Patch(url string, options Options) ([]byte, error) {
	return doRequest(http.MethodPatch, url, options)
}
func Delete(url string, options Options) ([]byte, error) {
	return doRequest(http.MethodDelete, url, options)
}
