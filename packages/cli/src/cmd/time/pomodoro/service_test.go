package pomodoro

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
	"time"
)

func captureOutput(fn func()) string {
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	fn()
	w.Close()
	var buf bytes.Buffer
	io.Copy(&buf, r)
	os.Stdout = old
	return buf.String()
}

func TestRunPomodoro_PrintsLaunchMessage(t *testing.T) {
	go func() {
		time.Sleep(50 * time.Millisecond)
		p, _ := os.FindProcess(os.Getpid())
		p.Signal(os.Interrupt)
	}()

	output := captureOutput(func() {
		if err := runPomodoro(25, 5); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Launching Pomodoro") {
		t.Errorf("expected launch message, got: %s", output)
	}
}

func TestRunPomodoro_interruptDuringRest(t *testing.T) {
	go func() {
		time.Sleep(100 * time.Millisecond)
		p, _ := os.FindProcess(os.Getpid())
		p.Signal(os.Interrupt)
	}()

	output := captureOutput(func() {
		if err := runPomodoro(0, 5); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Rest interval") {
		t.Errorf("expected rest interval message, got: %s", output)
	}
	if !strings.Contains(output, "Pomodoro session ended") {
		t.Errorf("expected end message, got: %s", output)
	}
}

func TestNewCmd_RunE(t *testing.T) {
	go func() {
		time.Sleep(50 * time.Millisecond)
		p, _ := os.FindProcess(os.Getpid())
		p.Signal(os.Interrupt)
	}()

	cmd := NewCmd()
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Launching Pomodoro") {
		t.Errorf("expected launch message, got: %s", output)
	}
}
