package clipboard

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/atotto/clipboard"
	_ "github.com/mattn/go-sqlite3"
)

var (
	jsonOutput         bool
	clipReadAll        = clipboard.ReadAll
	clipWait           = time.Sleep
	sqlOpen            = sql.Open
	runWatcherFn       = runWatcher
	testClipboardIters int
)

func runWatcher() {
	db, err := sqlOpen("sqlite3", "~/.omni/omni.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := createClipTable(db); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Clipboard watcher started... (Ctrl+C to stop)")
	clipboardLoop(db, clipReadAll, clipWait, testClipboardIters)
}

func clipboardLoop(db *sql.DB, readFn func() (string, error), sleepFn func(time.Duration), maxIters int) {
	var lastText string
	for iters := 0; maxIters <= 0 || iters < maxIters; iters++ {
		text, err := readFn()
		if err != nil {
			sleepFn(1 * time.Second)
			continue
		}

		if text == "" || text == lastText {
			sleepFn(500 * time.Millisecond)
			continue
		}

		err = insertClip(db, text)
		if err != nil {
			log.Println("insert error:", err)
		} else {
			if jsonOutput {
				out, err := json.MarshalIndent(map[string]interface{}{
					"content": text,
					"preview": previewClip(text),
				}, "", "  ")
				if err != nil {
					log.Printf("json error: %v", err)
				} else {
					fmt.Println(string(out))
				}
			} else {
				fmt.Println("Saved:", previewClip(text))
			}
		}

		lastText = text
		sleepFn(500 * time.Millisecond)
	}
}

func createClipTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS clips (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		content TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`
	_, err := db.Exec(query)
	return err
}

func insertClip(db *sql.DB, content string) error {
	_, err := db.Exec(
		`INSERT INTO clips (content) VALUES (?)`,
		content,
	)
	return err
}

func previewClip(text string) string {
	if len(text) > 40 {
		return text[:40] + "..."
	}
	return text
}
