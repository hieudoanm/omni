/// Parses `lsof -nP` output into `PortInfo` values.
///
/// Input rows look like:
///
///     COMMAND   PID     USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
///     node    21894 hieudoan   25u  IPv4 0x3390a1e95d00c687      0t0  TCP *:3000 (LISTEN)
///     node    21894 hieudoan   27u  IPv6 0x3390a146ee2b6d69      0t0  TCP *:3000 (LISTEN)
///     mDNSReso  761 hieudoan   12u  IPv4 0x3390a1e95d4c17cf      0t0  UDP *:5353
///
/// Parsing is defensive: header, blank, and malformed rows are skipped, and
/// rows are deduplicated per (pid, protocol, port, address). Command names may
/// be truncated by `lsof`, so they are reported as-is.
public enum LsofParser {
    public static func parse(_ output: String, protocolType: NetworkProtocol) -> [PortInfo] {
        var seen = Set<String>()
        var ports: [PortInfo] = []

        for line in output.split(whereSeparator: \.isNewline) {
            guard let port = makePortInfo(from: line, protocolType: protocolType) else { continue }
            let key = "\(port.pid)-\(protocolType.rawValue)-\(port.endpoint.port)-\(port.endpoint.address)"
            if seen.insert(key).inserted {
                ports.append(port)
            }
        }

        return ports.sorted {
            ($0.endpoint.port, $0.endpoint.protocolType.rawValue, $0.pid)
                < ($1.endpoint.port, $1.endpoint.protocolType.rawValue, $1.pid)
        }
    }

    static func makePortInfo(from line: Substring, protocolType: NetworkProtocol) -> PortInfo? {
        let fields = line.split(whereSeparator: { $0 == " " || $0 == "\t" })
        guard fields.count >= 4, fields[0] != "COMMAND", let pid = Int32(fields[1]), let name = fields.reversed().compactMap({ parseName(String($0)) }).first, !name.address.contains("->") else { return nil }

        let endpoint = NetworkEndpoint(
            port: name.port,
            protocolType: protocolType,
            address: name.address
        )
        return PortInfo(
            endpoint: endpoint,
            pid: pid,
            processName: String(fields[0]),
            state: .listening
        )
    }

    /// Extracts `(address, port)` from a `lsof` NAME token such as
    /// `*:3000`, `127.0.0.1:5432`, or `[::1]:8080`.
    static func parseName(_ token: String) -> (address: String, port: UInt16)? {
        guard let colon = token.lastIndex(of: ":") else { return nil }
        let portPart = token[token.index(after: colon)...]
        guard let port = UInt16(portPart) else { return nil }

        var address = String(token[..<colon])
        if address.hasPrefix("["), address.hasSuffix("]") {
            address = String(address.dropFirst().dropLast())
        }
        return (address: address, port: port)
    }
}
