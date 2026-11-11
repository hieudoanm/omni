//go:build darwin && !cgo

package wifi

func ScanWifi() (string, error) {
	return "", nil // WiFi scanning requires CGO and CoreWLAN framework
}
