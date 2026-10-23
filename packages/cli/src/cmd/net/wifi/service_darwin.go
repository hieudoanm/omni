//go:build darwin

package wifi

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework CoreWLAN -framework Foundation

#import <CoreWLAN/CoreWLAN.h>
#import <Foundation/Foundation.h>
#include <stdlib.h>

char* scanWifi() {
    @autoreleasepool {
        CWWiFiClient *client = [CWWiFiClient sharedWiFiClient];
        CWInterface *iface = [client interface];

        if (!iface) {
            return strdup("No WiFi interface found\n");
        }

        NSError *error = nil;
        NSSet<CWNetwork *> *networks = [iface scanForNetworksWithName:nil error:&error];

        if (error) {
            return strdup([[error localizedDescription] UTF8String]);
        }

        NSMutableString *result = [[NSMutableString alloc] init];

        for (CWNetwork *net in networks) {
            NSString *ssid = net.ssid ?: @"<hidden>";
            NSInteger rssi = net.rssiValue;

            const char *secStr = "OPEN";

            if ([net supportsSecurity:kCWSecurityWPA3Personal]) {
                secStr = "WPA3";
            } else if ([net supportsSecurity:kCWSecurityWPA2Personal]) {
                secStr = "WPA2";
            } else if ([net supportsSecurity:kCWSecurityWPAPersonal]) {
                secStr = "WPA";
            } else if ([net supportsSecurity:kCWSecurityWEP]) {
                secStr = "WEP";
            }

            [result appendFormat:@"%@ | RSSI: %ld | %s\n",
                ssid,
                (long)rssi,
                secStr
            ];
        }

        return strdup([result UTF8String]);
    }
}
*/
import "C"

import (
	"unsafe"
)

func ScanWifi() (string, error) {
	out := C.scanWifi()
	defer C.free(unsafe.Pointer(out))

	return C.GoString(out), nil
}
