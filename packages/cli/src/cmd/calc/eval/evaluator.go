package eval

import (
	"fmt"
	"math"
	"strconv"
	"strings"
)

type evaluator struct {
	s   string
	pos int
	tok string
	val float64
}

func newEvaluator(s string) *evaluator {
	e := &evaluator{s: s}
	e.lex()
	return e
}

func (e *evaluator) lex() {
	for e.pos < len(e.s) && e.s[e.pos] == ' ' {
		e.pos++
	}
	if e.pos >= len(e.s) {
		e.tok = "EOF"
		return
	}
	c := e.s[e.pos]
	if c >= '0' && c <= '9' || c == '.' {
		start := e.pos
		for e.pos < len(e.s) && (e.s[e.pos] >= '0' && e.s[e.pos] <= '9' || e.s[e.pos] == '.') {
			e.pos++
		}
		e.tok = "NUM"
		e.val, _ = strconv.ParseFloat(e.s[start:e.pos], 64)
		return
	}
	if c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c == '_' {
		start := e.pos
		for e.pos < len(e.s) && (e.s[e.pos] >= 'a' && e.s[e.pos] <= 'z' || e.s[e.pos] >= 'A' && e.s[e.pos] <= 'Z' || e.s[e.pos] >= '0' && e.s[e.pos] <= '9' || e.s[e.pos] == '_') {
			e.pos++
		}
		e.tok = e.s[start:e.pos]
		return
	}
	e.tok = string(c)
	e.pos++
}

func (e *evaluator) eval() (float64, error) {
	v, err := e.parseExpr()
	if err != nil {
		return 0, err
	}
	if e.tok != "EOF" {
		return 0, fmt.Errorf("unexpected token %q at position %d", e.tok, e.pos)
	}
	return v, nil
}

func (e *evaluator) parseExpr() (float64, error) {
	v, err := e.parseTerm()
	if err != nil {
		return 0, err
	}
	for e.tok == "+" || e.tok == "-" {
		op := e.tok
		e.lex()
		rhs, err := e.parseTerm()
		if err != nil {
			return 0, err
		}
		if op == "+" {
			v += rhs
		} else {
			v -= rhs
		}
	}
	return v, nil
}

func (e *evaluator) parseTerm() (float64, error) {
	v, err := e.parsePower()
	if err != nil {
		return 0, err
	}
	for e.tok == "*" || e.tok == "/" {
		op := e.tok
		e.lex()
		rhs, err := e.parsePower()
		if err != nil {
			return 0, err
		}
		if op == "*" {
			v *= rhs
		} else {
			if rhs == 0 {
				return 0, fmt.Errorf("division by zero")
			}
			v /= rhs
		}
	}
	return v, nil
}

func (e *evaluator) parsePower() (float64, error) {
	v, err := e.parseUnary()
	if err != nil {
		return 0, err
	}
	if e.tok == "^" {
		e.lex()
		rhs, err := e.parsePower()
		if err != nil {
			return 0, err
		}
		v = math.Pow(v, rhs)
	}
	return v, nil
}

func (e *evaluator) parseUnary() (float64, error) {
	if e.tok == "-" {
		e.lex()
		v, err := e.parseUnary()
		if err != nil {
			return 0, err
		}
		return -v, nil
	}
	if e.tok == "+" {
		e.lex()
		return e.parseUnary()
	}
	return e.parsePrimary()
}

func (e *evaluator) parsePrimary() (float64, error) {
	switch e.tok {
	case "NUM":
		v := e.val
		e.lex()
		return v, nil
	case "pi", "\u03c0":
		e.lex()
		return math.Pi, nil
	case "e":
		e.lex()
		return math.E, nil
	case "(":
		e.lex()
		v, err := e.parseExpr()
		if err != nil {
			return 0, err
		}
		if e.tok != ")" {
			return 0, fmt.Errorf("expected ')' got %q", e.tok)
		}
		e.lex()
		return v, nil
	default:
		name := e.tok
		e.lex()
		if e.tok != "(" {
			return 0, fmt.Errorf("expected '(' after %s", name)
		}
		e.lex()
		arg, err := e.parseExpr()
		if err != nil {
			return 0, err
		}
		if e.tok != ")" {
			return 0, fmt.Errorf("expected ')' after %s argument", name)
		}
		e.lex()
		return applyFn(name, arg)
	}
}

func applyFn(name string, x float64) (float64, error) {
	switch strings.ToLower(name) {
	case "sqrt":
		return math.Sqrt(x), nil
	case "sin":
		return math.Sin(x), nil
	case "cos":
		return math.Cos(x), nil
	case "tan":
		return math.Tan(x), nil
	case "abs":
		return math.Abs(x), nil
	case "floor":
		return math.Floor(x), nil
	case "ceil":
		return math.Ceil(x), nil
	case "round":
		return math.Round(x), nil
	case "log":
		return math.Log(x), nil
	case "log10":
		return math.Log10(x), nil
	case "exp":
		return math.Exp(x), nil
	default:
		return 0, fmt.Errorf("unknown function %q", name)
	}
}
