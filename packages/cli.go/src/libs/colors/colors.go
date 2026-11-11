package colors

import "os"

var enableColor = isTerminal()

func isTerminal() bool {
	fi, err := os.Stdout.Stat()
	if err != nil {
		return false
	}
	return (fi.Mode() & os.ModeCharDevice) != 0
}

func Green(s string) string {
	if !enableColor {
		return s
	}
	return "\033[32m" + s + "\033[0m"
}

func Red(s string) string {
	if !enableColor {
		return s
	}
	return "\033[31m" + s + "\033[0m"
}

func Yellow(s string) string {
	if !enableColor {
		return s
	}
	return "\033[33m" + s + "\033[0m"
}

func Cyan(s string) string {
	if !enableColor {
		return s
	}
	return "\033[36m" + s + "\033[0m"
}

func Dim(s string) string {
	if !enableColor {
		return s
	}
	return "\033[2m" + s + "\033[0m"
}

func Blue(s string) string {
	if !enableColor {
		return s
	}
	return "\033[34m" + s + "\033[0m"
}

func Gray(s string) string {
	if !enableColor {
		return s
	}
	return "\033[90m" + s + "\033[0m"
}

func Bold(s string) string {
	if !enableColor {
		return s
	}
	return "\033[1m" + s + "\033[0m"
}
