package internal

import (
	"os"
	"path/filepath"
	"testing"
)

func TestSplitLines(t *testing.T) {
	tests := []struct {
		input    string
		expected int
	}{
		{"", 0},
		{"hello", 1},
		{"line1\nline2\nline3", 3},
		{"a\nb\nc\n", 3},
	}
	for _, tc := range tests {
		lines := splitLines(tc.input)
		if len(lines) != tc.expected {
			t.Errorf("splitLines(%q) returned %d lines, want %d", tc.input, len(lines), tc.expected)
		}
	}
}

func TestIsExported(t *testing.T) {
	tests := []struct {
		name     string
		expected bool
	}{
		{"Foo", true},
		{"Bar", true},
		{"foo", false},
		{"bar", false},
		{"", false},
		{"_hidden", false},
	}
	for _, tc := range tests {
		got := isExported(tc.name)
		if got != tc.expected {
			t.Errorf("isExported(%q) = %v, want %v", tc.name, got, tc.expected)
		}
	}
}

func TestFileBaseName(t *testing.T) {
	tests := []struct {
		path     string
		expected string
	}{
		{"main.go", "main"},
		{"/path/to/lib.ts", "lib"},
		{"foo.test.go", "foo.test"},
		{"noext", "noext"},
		{".hidden", ""},
		{"/a/b/c/d.py", "d"},
	}
	for _, tc := range tests {
		got := fileBaseName(tc.path)
		if got != tc.expected {
			t.Errorf("fileBaseName(%q) = %q, want %q", tc.path, got, tc.expected)
		}
	}
}

func TestExtractGo_functions(t *testing.T) {
	src := `package foo
func Hello() {}
func private() {}`
	info := &FileInfo{}
	extractGo(src, info)

	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 symbols, got %d", len(info.Symbols))
	}

	sym := info.Symbols[0]
	if sym.Name != "Hello" || sym.Kind != KindFunction || !sym.Exported || sym.Receiver != "" {
		t.Errorf("unexpected first symbol: %+v", sym)
	}

	sym = info.Symbols[1]
	if sym.Name != "private" || sym.Kind != KindFunction || sym.Exported || sym.Receiver != "" {
		t.Errorf("unexpected second symbol: %+v", sym)
	}
}

func TestExtractGo_method(t *testing.T) {
	src := `package foo
func (r *Receiver) Method() {}`
	info := &FileInfo{}
	extractGo(src, info)

	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}

	sym := info.Symbols[0]
	if sym.Name != "Method" || sym.Kind != KindMethod || sym.Receiver != "r" {
		t.Errorf("unexpected method symbol: %+v", sym)
	}
}

func TestExtractGo_type(t *testing.T) {
	src := `package foo
type Person struct {}
type Worker interface {}`
	info := &FileInfo{}
	extractGo(src, info)

	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 symbols, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "Person" || info.Symbols[0].Kind != KindType {
		t.Errorf("expected Person type, got %+v", info.Symbols[0])
	}
	if info.Symbols[1].Name != "Worker" || info.Symbols[1].Kind != KindInterface {
		t.Errorf("expected Worker interface, got %+v", info.Symbols[1])
	}
}

func TestExtractGo_varConst(t *testing.T) {
	src := `package foo
var Version string
const MaxRetries = 3`
	info := &FileInfo{}
	extractGo(src, info)

	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 symbols, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "Version" || info.Symbols[0].Kind != KindVariable {
		t.Errorf("expected Version variable, got %+v", info.Symbols[0])
	}
}

func TestExtractGo_calls(t *testing.T) {
	src := `package foo
func Caller() {
	Helper()
	Another()
}`
	info := &FileInfo{}
	extractGo(src, info)

	if len(info.Calls) != 2 {
		t.Fatalf("expected 2 calls, got %d", len(info.Calls))
	}

	if info.Calls[0].CallerName != "Caller" || info.Calls[0].CalleeName != "Helper" {
		t.Errorf("unexpected call: %+v", info.Calls[0])
	}
}

func TestExtractGo_calls_filterBuiltin(t *testing.T) {
	src := `package foo
func Run() {
	fmt.Println("hello")
	len("test")
}`
	info := &FileInfo{}
	extractGo(src, info)

	for _, c := range info.Calls {
		if c.CalleeName == "fmt" || c.CalleeName == "len" {
			t.Errorf("builtin call should be filtered: %+v", c)
		}
	}
}

func TestExtractGo_calls_skipSelf(t *testing.T) {
	src := `package foo
func Foo() {
	Foo()
}`
	info := &FileInfo{}
	extractGo(src, info)

	if len(info.Calls) != 0 {
		t.Errorf("self-call should be filtered, got %d calls", len(info.Calls))
	}
}

func TestExtractTS_function(t *testing.T) {
	src := `function greet(name: string): void {}
export function add(a: number, b: number): number {}`
	info := &FileInfo{}
	extractTS(src, info)

	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 symbols, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "greet" || info.Symbols[0].Kind != KindFunction || info.Symbols[0].Exported {
		t.Errorf("unexpected first symbol: %+v", info.Symbols[0])
	}
	if info.Symbols[1].Name != "add" || info.Symbols[1].Kind != KindFunction || !info.Symbols[1].Exported {
		t.Errorf("unexpected second symbol: %+v", info.Symbols[1])
	}
}

func TestExtractTS_arrow(t *testing.T) {
	src := `const handler = (x: number) => x + 1`
	info := &FileInfo{}
	extractTS(src, info)

	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "handler" || info.Symbols[0].Kind != KindFunction {
		t.Errorf("unexpected arrow symbol: %+v", info.Symbols[0])
	}
}

func TestExtractTS_class(t *testing.T) {
	src := `class MyClass {}
export class ExportedClass {}`
	info := &FileInfo{}
	extractTS(src, info)

	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 symbols, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "MyClass" || info.Symbols[0].Kind != KindClass {
		t.Errorf("expected class, got %+v", info.Symbols[0])
	}
}

func TestExtractTS_interface(t *testing.T) {
	src := `interface User {}`
	info := &FileInfo{}
	extractTS(src, info)

	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}
	if info.Symbols[0].Name != "User" || info.Symbols[0].Kind != KindInterface {
		t.Errorf("expected interface, got %+v", info.Symbols[0])
	}
}

func TestExtractTS_type(t *testing.T) {
	src := `type Options = { a: number }`
	info := &FileInfo{}
	extractTS(src, info)

	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}
	if info.Symbols[0].Name != "Options" || info.Symbols[0].Kind != KindType {
		t.Errorf("expected type alias, got %+v", info.Symbols[0])
	}
}

func TestExtractTS_const(t *testing.T) {
	src := `const MAX = 100`
	info := &FileInfo{}
	extractTS(src, info)

	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}
	if info.Symbols[0].Name != "MAX" || info.Symbols[0].Kind != KindConstant {
		t.Errorf("expected constant, got %+v", info.Symbols[0])
	}
}

func TestExtractPython_def(t *testing.T) {
	src := `def hello():
    pass
def _private():
    pass`
	info := &FileInfo{}
	extractPython(src, info)

	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 symbols, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "hello" || info.Symbols[0].Kind != KindFunction || !info.Symbols[0].Exported {
		t.Errorf("unexpected first symbol: %+v", info.Symbols[0])
	}
	if info.Symbols[1].Name != "_private" || info.Symbols[1].Exported {
		t.Errorf("expected _private to be unexported, got %+v", info.Symbols[1])
	}
}

func TestExtractPython_asyncDef(t *testing.T) {
	src := `async def fetch():
    pass`
	info := &FileInfo{}
	extractPython(src, info)

	if len(info.Symbols) != 1 || info.Symbols[0].Name != "fetch" {
		t.Errorf("expected fetch function, got %+v", info.Symbols)
	}
}

func TestExtractPython_class(t *testing.T) {
	src := `class MyClass:
    pass
class _Hidden:
    pass`
	info := &FileInfo{}
	extractPython(src, info)

	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 symbols, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "MyClass" || info.Symbols[0].Kind != KindClass || !info.Symbols[0].Exported {
		t.Errorf("unexpected first symbol: %+v", info.Symbols[0])
	}
}

func TestExtractPython_const(t *testing.T) {
	src := `MAX_RETRIES = 3
TIMEOUT = 30`
	info := &FileInfo{}
	extractPython(src, info)

	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 constants, got %d", len(info.Symbols))
	}

	for _, sym := range info.Symbols {
		if sym.Kind != KindConstant || !sym.Exported {
			t.Errorf("expected exported constant, got %+v", sym)
		}
	}
}

func TestExtractRust_fn(t *testing.T) {
	src := `fn helper() {}
pub fn public_fn() {}`
	info := &FileInfo{}
	extractRust(src, info)

	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 symbols, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "helper" || info.Symbols[0].Kind != KindFunction || info.Symbols[0].Exported {
		t.Errorf("unexpected first symbol: %+v", info.Symbols[0])
	}
	if info.Symbols[1].Name != "public_fn" || info.Symbols[1].Kind != KindFunction || !info.Symbols[1].Exported {
		t.Errorf("unexpected second symbol: %+v", info.Symbols[1])
	}
}

func TestExtractRust_struct(t *testing.T) {
	src := `struct Point { x: i32, y: i32 }`
	info := &FileInfo{}
	extractRust(src, info)

	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "Point" || info.Symbols[0].Kind != KindType {
		t.Errorf("expected type (struct), got %+v", info.Symbols[0])
	}
}

func TestExtractRust_trait(t *testing.T) {
	src := `trait Display {}`
	info := &FileInfo{}
	extractRust(src, info)

	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "Display" || info.Symbols[0].Kind != KindInterface {
		t.Errorf("expected interface (trait), got %+v", info.Symbols[0])
	}
}

func TestExtractRust_enum(t *testing.T) {
	src := `enum Color { Red, Green, Blue }`
	info := &FileInfo{}
	extractRust(src, info)

	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "Color" || info.Symbols[0].Kind != KindType {
		t.Errorf("expected type (enum), got %+v", info.Symbols[0])
	}
}

func TestExtractRust_const(t *testing.T) {
	src := `const MAX: usize = 100`
	info := &FileInfo{}
	extractRust(src, info)

	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}

	if info.Symbols[0].Name != "MAX" || info.Symbols[0].Kind != KindConstant {
		t.Errorf("expected constant, got %+v", info.Symbols[0])
	}
}

func TestIsGoBuiltin(t *testing.T) {
	if !isGoBuiltin("append") {
		t.Error("append should be a Go builtin")
	}
	if !isGoBuiltin("fmt") {
		t.Error("fmt should be a Go builtin")
	}
	if isGoBuiltin("CustomFunc") {
		t.Error("CustomFunc should not be a Go builtin")
	}
}

func TestIsTSBuiltin(t *testing.T) {
	if !isTSBuiltin("console") {
		t.Error("console should be a TS builtin")
	}
	if !isTSBuiltin("JSON") {
		t.Error("JSON should be a TS builtin")
	}
	if isTSBuiltin("myFunction") {
		t.Error("myFunction should not be a TS builtin")
	}
}

func TestIsPyBuiltin(t *testing.T) {
	if !isPyBuiltin("print") {
		t.Error("print should be a Python builtin")
	}
	if isPyBuiltin("myFunc") {
		t.Error("myFunc should not be a Python builtin")
	}
}

func TestIsRsBuiltin(t *testing.T) {
	if !isRsBuiltin("println") {
		t.Error("println should be a Rust builtin")
	}
	if isRsBuiltin("myFunc") {
		t.Error("myFunc should not be a Rust builtin")
	}
}

func TestExtract_realFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.go")
	src := `package test

func Hello() {
	World()
}

func World() string {
	return "hello"
}
`
	if err := os.WriteFile(path, []byte(src), 0644); err != nil {
		t.Fatal(err)
	}

	f := File{AbsPath: path, RelPath: "test.go", Lang: LangGo}
	info, err := Extract(f)
	if err != nil {
		t.Fatal(err)
	}

	if len(info.Symbols) != 2 {
		t.Errorf("expected 2 symbols, got %d", len(info.Symbols))
	}

	var hasCall bool
	for _, c := range info.Calls {
		if c.CallerName == "Hello" && c.CalleeName == "World" {
			hasCall = true
			break
		}
	}
	if !hasCall {
		t.Error("expected Hello -> World call edge")
	}
}

func TestExtract_goStructInterface(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "types.go")
	src := `package types
type User struct {
	Name string
}
type Storage interface {
	Get(id string) (User, error)
}`
	if err := os.WriteFile(path, []byte(src), 0644); err != nil {
		t.Fatal(err)
	}
	f := File{AbsPath: path, RelPath: "types.go", Lang: LangGo}
	info, err := Extract(f)
	if err != nil {
		t.Fatal(err)
	}
	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 symbols, got %d", len(info.Symbols))
	}
	if info.Symbols[0].Name != "User" || info.Symbols[0].Kind != KindType {
		t.Errorf("expected User type, got %+v", info.Symbols[0])
	}
	if info.Symbols[1].Name != "Storage" || info.Symbols[1].Kind != KindInterface {
		t.Errorf("expected Storage interface, got %+v", info.Symbols[1])
	}
}

func TestExtract_goVarConst(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "vars.go")
	src := `package vars
var Name string
const MaxCount = 100`
	if err := os.WriteFile(path, []byte(src), 0644); err != nil {
		t.Fatal(err)
	}
	f := File{AbsPath: path, RelPath: "vars.go", Lang: LangGo}
	info, err := Extract(f)
	if err != nil {
		t.Fatal(err)
	}
	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 symbols, got %d", len(info.Symbols))
	}
	if info.Symbols[0].Name != "Name" || info.Symbols[0].Kind != KindVariable {
		t.Errorf("expected Name variable, got %+v", info.Symbols[0])
	}
}

func TestExtract_ts(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "app.ts")
	src := `export function greet(name: string): string {
	return hello(name)
}
function hello(name: string): string {
	return "hello " + name
}
export class Service {}
`
	if err := os.WriteFile(path, []byte(src), 0644); err != nil {
		t.Fatal(err)
	}
	f := File{AbsPath: path, RelPath: "app.ts", Lang: LangTypeScript}
	info, err := Extract(f)
	if err != nil {
		t.Fatal(err)
	}
	if len(info.Symbols) != 3 {
		t.Fatalf("expected 3 symbols, got %d", len(info.Symbols))
	}
	if info.Symbols[0].Name != "greet" || info.Symbols[0].Kind != KindFunction || !info.Symbols[0].Exported {
		t.Errorf("unexpected symbol: %+v", info.Symbols[0])
	}
	if info.Symbols[2].Name != "Service" || info.Symbols[2].Kind != KindClass {
		t.Errorf("expected Service class, got %+v", info.Symbols[2])
	}
	var hasCall bool
	for _, c := range info.Calls {
		if c.CallerName == "greet" && c.CalleeName == "hello" {
			hasCall = true
			break
		}
	}
	if !hasCall {
		t.Error("expected greet -> hello call edge")
	}
}

func TestExtract_python(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "main.py")
	src := `def run():
    helper()

def helper():
    pass

class App:
    pass

MAX_RETRIES = 3
`
	if err := os.WriteFile(path, []byte(src), 0644); err != nil {
		t.Fatal(err)
	}
	f := File{AbsPath: path, RelPath: "main.py", Lang: LangPython}
	info, err := Extract(f)
	if err != nil {
		t.Fatal(err)
	}
	if len(info.Symbols) != 4 {
		t.Fatalf("expected 4 symbols, got %d", len(info.Symbols))
	}
	if info.Symbols[0].Name != "run" || info.Symbols[0].Kind != KindFunction {
		t.Errorf("expected run function, got %+v", info.Symbols[0])
	}
	if info.Symbols[2].Name != "App" || info.Symbols[2].Kind != KindClass {
		t.Errorf("expected App class, got %+v", info.Symbols[2])
	}
	if info.Symbols[3].Name != "MAX_RETRIES" || info.Symbols[3].Kind != KindConstant {
		t.Errorf("expected MAX_RETRIES constant, got %+v", info.Symbols[3])
	}
	var hasCall bool
	for _, c := range info.Calls {
		if c.CallerName == "run" && c.CalleeName == "helper" {
			hasCall = true
			break
		}
	}
	if !hasCall {
		t.Error("expected run -> helper call edge")
	}
}

func TestExtract_rust(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "lib.rs")
	src := `pub fn run() {
    helper();
}

fn helper() {
}

pub struct Config {}
`
	if err := os.WriteFile(path, []byte(src), 0644); err != nil {
		t.Fatal(err)
	}
	f := File{AbsPath: path, RelPath: "lib.rs", Lang: LangRust}
	info, err := Extract(f)
	if err != nil {
		t.Fatal(err)
	}
	if len(info.Symbols) != 3 {
		t.Fatalf("expected 3 symbols, got %d", len(info.Symbols))
	}
	if info.Symbols[0].Name != "run" || info.Symbols[0].Kind != KindFunction || !info.Symbols[0].Exported {
		t.Errorf("expected exported run function, got %+v", info.Symbols[0])
	}
	if info.Symbols[2].Name != "Config" || info.Symbols[2].Kind != KindType {
		t.Errorf("expected Config struct type, got %+v", info.Symbols[2])
	}
	var hasCall bool
	for _, c := range info.Calls {
		if c.CallerName == "run" && c.CalleeName == "helper" {
			hasCall = true
			break
		}
	}
	if !hasCall {
		t.Error("expected run -> helper call edge")
	}
}

func TestExtract_unknownLang(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "file.txt")
	src := `some text`
	if err := os.WriteFile(path, []byte(src), 0644); err != nil {
		t.Fatal(err)
	}
	f := File{AbsPath: path, RelPath: "file.txt", Lang: LangUnknown}
	info, err := Extract(f)
	if err != nil {
		t.Fatal(err)
	}
	if len(info.Symbols) != 0 {
		t.Errorf("expected 0 symbols for unknown lang, got %d", len(info.Symbols))
	}
}

func TestExtract_fileNotFound(t *testing.T) {
	f := File{AbsPath: "/nonexistent/path.go", RelPath: "path.go", Lang: LangGo}
	_, err := Extract(f)
	if err == nil {
		t.Error("expected error for nonexistent file")
	}
}

func TestExtractGo_emptyFile(t *testing.T) {
	info := &FileInfo{}
	extractGo("", info)
	if len(info.Symbols) != 0 {
		t.Errorf("expected 0 symbols for empty file, got %d", len(info.Symbols))
	}
	if len(info.Calls) != 0 {
		t.Errorf("expected 0 calls for empty file, got %d", len(info.Calls))
	}
}

func TestExtractGo_commentsOnly(t *testing.T) {
	src := `// this is a comment
/* block comment */
`
	info := &FileInfo{}
	extractGo(src, info)
	if len(info.Symbols) != 0 {
		t.Errorf("expected 0 symbols for comments-only file, got %d", len(info.Symbols))
	}
}

func TestExtractGo_genericFunction(t *testing.T) {
	src := `package p
func Map[T any](items []T, fn func(T) T) []T { return nil }`
	info := &FileInfo{}
	extractGo(src, info)
	if len(info.Symbols) != 0 {
		t.Fatalf("expected 0 symbols (generics not supported), got %d", len(info.Symbols))
	}
}

func TestExtractGo_methodWithCalls(t *testing.T) {
	src := `package p
func (s *Service) Run() {
	s.parse()
}
func (s *Service) parse() {}`
	info := &FileInfo{}
	extractGo(src, info)
	if len(info.Symbols) != 2 {
		t.Fatalf("expected 2 symbols, got %d", len(info.Symbols))
	}
	if info.Symbols[0].Name != "Run" || info.Symbols[0].Kind != KindMethod {
		t.Errorf("expected Run method, got %+v", info.Symbols[0])
	}
	var hasCall bool
	for _, c := range info.Calls {
		if c.CallerName == "Run" && c.CalleeName == "parse" {
			hasCall = true
			break
		}
	}
	if !hasCall {
		t.Error("expected Run -> parse call edge")
	}
}

func TestExtractTS_asyncFunction(t *testing.T) {
	src := `async function fetchData() {
	return getData()
}`
	info := &FileInfo{}
	extractTS(src, info)
	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}
	if info.Symbols[0].Name != "fetchData" || info.Symbols[0].Kind != KindFunction {
		t.Errorf("expected fetchData function, got %+v", info.Symbols[0])
	}
}

func TestExtractRust_asyncFn(t *testing.T) {
	src := `async fn fetch() -> String { String::new() }`
	info := &FileInfo{}
	extractRust(src, info)
	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}
	if info.Symbols[0].Name != "fetch" || info.Symbols[0].Kind != KindFunction {
		t.Errorf("expected fetch function, got %+v", info.Symbols[0])
	}
}

func TestExtractPython_multiline(t *testing.T) {
	src := "def process():\n    parse()\n    validate()\n"
	info := &FileInfo{}
	extractPython(src, info)
	if len(info.Symbols) != 1 {
		t.Fatalf("expected 1 symbol, got %d", len(info.Symbols))
	}
	if len(info.Calls) != 2 {
		t.Fatalf("expected 2 calls, got %d", len(info.Calls))
	}
	if info.Calls[0].CalleeName != "parse" || info.Calls[1].CalleeName != "validate" {
		t.Errorf("unexpected calls: %+v", info.Calls)
	}
}
