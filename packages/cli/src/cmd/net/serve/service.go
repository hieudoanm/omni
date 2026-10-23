package serve

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"path/filepath"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func serveRun(port int, dir, certFile, keyFile string, cors, serveJSON bool) error {
	absDir, err := filepath.Abs(dir)
	if err != nil {
		return err
	}

	info, err := os.Stat(absDir)
	if err != nil {
		return fmt.Errorf("directory error: %w", err)
	}
	if !info.IsDir() {
		return fmt.Errorf("%s is not a directory", absDir)
	}

	mux := http.NewServeMux()
	fs := http.FileServer(http.Dir(absDir))

	if cors {
		mux.Handle("/", corsMiddleware(fs))
	} else {
		mux.Handle("/", fs)
	}

	addr := fmt.Sprintf(":%d", port)
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("port %d unavailable: %w", port, err)
	}
	listener.Close()

	if serveJSON {
		out, err := json.MarshalIndent(map[string]interface{}{
			"directory": absDir,
			"url":       fmt.Sprintf("http://localhost:%d", port),
			"port":      port,
			"tls":       certFile != "" && keyFile != "",
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Printf("Serving %s on http://localhost:%d\n", absDir, port)
	}
	if certFile != "" && keyFile != "" {
		fmt.Printf("TLS enabled (cert: %s, key: %s)\n", certFile, keyFile)
		return http.ListenAndServeTLS(addr, certFile, keyFile, mux)
	}
	return http.ListenAndServe(addr, mux)
}
