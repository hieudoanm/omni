package og

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/shared"
)

func TestFetchOG(t *testing.T) {
	repoBody := `{"name":"test-repo","full_name":"owner/test-repo","description":"A test repo","html_url":"https://github.com/owner/test-repo","stargazers_count":42,"forks_count":7,"language":"Go","owner":{"login":"owner","avatar_url":"https://avatars.githubusercontent.com/u/1"}}`

	tests := []struct {
		name    string
		repo    string
		output  string
		mocks   []shared.MockResult
		wantErr string
	}{
		{
			name:   "success",
			repo:   "owner/repo",
			output: "og.svg",
			mocks: []shared.MockResult{
				{Body: []byte(repoBody)},
			},
		},
		{
			name:    "invalid repo format",
			repo:    "invalid",
			output:  "og.svg",
			wantErr: "repo must be in format owner/repo",
		},
		{
			name:   "fetch error",
			repo:   "owner/repo",
			output: "og.svg",
			mocks: []shared.MockResult{
				{Err: errors.New("network error")},
			},
			wantErr: "error fetching repository",
		},
		{
			name:   "invalid JSON",
			repo:   "owner/repo",
			output: "og.svg",
			mocks: []shared.MockResult{
				{Body: []byte("invalid json")},
			},
			wantErr: "error parsing response",
		},
		{
			name:   "file write error",
			repo:   "owner/repo",
			output: "/nonexistent/deep/dir/og.svg",
			mocks: []shared.MockResult{
				{Body: []byte(repoBody)},
			},
			wantErr: "error writing SVG",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dir := t.TempDir()
			outPath := tt.output
			if !filepath.IsAbs(outPath) {
				outPath = filepath.Join(dir, outPath)
			}

			mock := shared.MockFetchSeq(tt.mocks...)
			err := fetchOG(tt.repo, outPath, mock)

			if tt.wantErr != "" {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				if !strings.Contains(err.Error(), tt.wantErr) {
					t.Errorf("err = %q, want contains %q", err.Error(), tt.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			data, err := os.ReadFile(outPath)
			if err != nil {
				t.Fatalf("error reading output file: %v", err)
			}
			svg := string(data)
			if !strings.Contains(svg, "test-repo") {
				t.Error("expected SVG to contain repo name")
			}
			if !strings.Contains(svg, "★ 42") {
				t.Error("expected SVG to contain star count")
			}
		})
	}
}

func TestEscapeXML(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{`&`, `&amp;`},
		{`<`, `&lt;`},
		{`>`, `&gt;`},
		{`'`, `&apos;`},
		{`"`, `&quot;`},
		{`hello & world <foo>`, `hello &amp; world &lt;foo&gt;`},
		{`normal text`, `normal text`},
		{``, ``},
	}

	for _, tt := range tests {
		got := escapeXML(tt.input)
		if got != tt.want {
			t.Errorf("escapeXML(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}

func TestGenerateOGSVG(t *testing.T) {
	repo := ghRepo{
		Name:        "test-repo",
		FullName:    "owner/test-repo",
		Description: "A test repository",
		HTMLURL:     "https://github.com/owner/test-repo",
		Stars:       42,
		Forks:       7,
		Language:    "Go",
		Owner: struct {
			Login     string `json:"login"`
			AvatarURL string `json:"avatar_url"`
		}{
			Login:     "owner",
			AvatarURL: "https://avatars.githubusercontent.com/u/1",
		},
	}

	svg := GenerateOGSVG(repo)

	if !strings.HasPrefix(svg, `<svg xmlns="http://www.w3.org/2000/svg"`) {
		t.Error("expected SVG namespace prefix")
	}
	if !strings.HasSuffix(strings.TrimSpace(svg), "</svg>") {
		t.Error("expected SVG closing tag")
	}
	if !strings.Contains(svg, "test-repo") {
		t.Error("expected SVG to contain repo name")
	}
	if !strings.Contains(svg, "owner") {
		t.Error("expected SVG to contain owner login")
	}
	if !strings.Contains(svg, "A test repository") {
		t.Error("expected SVG to contain description")
	}
	if !strings.Contains(svg, "★ 42") {
		t.Error("expected SVG to contain star count")
	}
	if !strings.Contains(svg, "⑂ 7") {
		t.Error("expected SVG to contain fork count")
	}
	if !strings.Contains(svg, `width="1200"`) {
		t.Error("expected SVG width 1200")
	}
	if !strings.Contains(svg, `height="630"`) {
		t.Error("expected SVG height 630")
	}
}

func TestGenerateOGSVG_emptyDescription(t *testing.T) {
	repo := ghRepo{
		Name:     "empty-desc",
		FullName: "u/empty-desc",
		Language: "Rust",
		Owner: struct {
			Login     string `json:"login"`
			AvatarURL string `json:"avatar_url"`
		}{
			Login: "u",
		},
	}

	svg := GenerateOGSVG(repo)

	if !strings.Contains(svg, "No description") {
		t.Error("expected default text for empty description")
	}
}

func TestGenerateOGSVG_longDescription(t *testing.T) {
	longDesc := strings.Repeat("a", 200)
	repo := ghRepo{
		Name:        "long-desc",
		FullName:    "u/long-desc",
		Description: longDesc,
		Language:    "Python",
		Owner: struct {
			Login     string `json:"login"`
			AvatarURL string `json:"avatar_url"`
		}{
			Login: "u",
		},
	}

	svg := GenerateOGSVG(repo)

	if !strings.Contains(svg, "...") {
		t.Error("expected truncated description to end with ...")
	}
	if strings.Contains(svg, longDesc) {
		t.Error("expected long description to be truncated")
	}
}

func TestGenerateOGSVG_unknownLanguageColor(t *testing.T) {
	repo := ghRepo{
		Name:     "unknown-lang",
		FullName: "u/unknown-lang",
		Language: "FooLang",
		Owner: struct {
			Login     string `json:"login"`
			AvatarURL string `json:"avatar_url"`
		}{
			Login: "u",
		},
	}

	svg := GenerateOGSVG(repo)

	if !strings.Contains(svg, `fill="#6e7681"`) {
		t.Error("expected unknown language to use default color")
	}
}

func TestRunOG_jsonOutput(t *testing.T) {
	repoBody := `{"name":"test-repo","full_name":"owner/test-repo","description":"A test repo","html_url":"https://github.com/owner/test-repo","stargazers_count":42,"forks_count":7,"language":"Go","owner":{"login":"owner","avatar_url":"https://avatars.githubusercontent.com/u/1"}}`

	old := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte(repoBody)})
	defer func() { shared.FetchFuncDefault = old }()

	r, w, _ := os.Pipe()
	oldStdout := os.Stdout
	os.Stdout = w

	err := runOG("owner/repo", "", true)

	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = oldStdout

	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(out), `"title": "owner/test-repo"`) {
		t.Error("expected JSON output to contain title")
	}
	if !strings.Contains(string(out), `"description": "A test repo"`) {
		t.Error("expected JSON output to contain description")
	}
}

func TestRunOG_jsonOutput_invalidRepo(t *testing.T) {
	err := runOG("invalid", "", true)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "repo must be in format owner/repo") {
		t.Errorf("err = %q, want format error", err.Error())
	}
}

func TestRunOG_jsonOutput_fetchError(t *testing.T) {
	old := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Err: errors.New("network error")})
	defer func() { shared.FetchFuncDefault = old }()

	err := runOG("owner/repo", "", true)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "error fetching repository") {
		t.Errorf("err = %q, want fetch error", err.Error())
	}
}

func TestRunOG_jsonOutput_parseError(t *testing.T) {
	old := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte("invalid json")})
	defer func() { shared.FetchFuncDefault = old }()

	err := runOG("owner/repo", "", true)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "error parsing response") {
		t.Errorf("err = %q, want parse error", err.Error())
	}
}
