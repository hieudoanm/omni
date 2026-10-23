//! Minimal synchronous DNS resolver (UDP/53) covering the record types the
//! Go `net ip dns` command needs: A, AAAA, CNAME, MX, NS, TXT.
use anyhow::{anyhow, Result};
use clap::Args;
use serde::Serialize;
use std::net::{IpAddr, Ipv4Addr, Ipv6Addr, SocketAddr, UdpSocket};
use std::time::Duration;

#[derive(Args)]
pub struct DnsArgs {
    /// Domain to look up
    #[arg(long, short = 'd', default_value = "")]
    pub domain: String,
    /// Record type (a, aaaa, cname, mx, ns, txt)
    #[arg(long, short = 't', default_value = "")]
    pub record_type: String,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

#[derive(Serialize, Default)]
struct DnsResult {
    domain: String,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    a: Vec<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    aaaa: Vec<String>,
    #[serde(skip_serializing_if = "String::is_empty")]
    cname: String,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    mx: Vec<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    ns: Vec<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    txt: Vec<String>,
}

const TYPE_A: u16 = 1;
const TYPE_NS: u16 = 2;
const TYPE_CNAME: u16 = 5;
const TYPE_MX: u16 = 15;
const TYPE_TXT: u16 = 16;
const TYPE_AAAA: u16 = 28;

pub fn run(args: &DnsArgs) -> Result<()> {
    let types: Vec<String> = if args.record_type.is_empty() {
        vec!["a", "aaaa", "cname", "mx", "ns", "txt"]
            .into_iter()
            .map(String::from)
            .collect()
    } else {
        vec![args.record_type.to_lowercase()]
    };

    let mut result = DnsResult {
        domain: args.domain.clone(),
        ..Default::default()
    };

    for t in &types {
        match t.as_str() {
            "a" | "aaaa" => {
                let want_v4 = t == "a";
                if let Ok(ips) = lookup(&args.domain, if want_v4 { TYPE_A } else { TYPE_AAAA }) {
                    for ip in ips {
                        if ip.is_ipv4() == want_v4 {
                            if want_v4 {
                                result.a.push(ip.to_string());
                            } else {
                                result.aaaa.push(ip.to_string());
                            }
                        }
                    }
                }
            }
            "cname" => {
                if let Ok(names) = lookup_names(&args.domain, TYPE_CNAME) {
                    if let Some(first) = names.first() {
                        result.cname = first.trim_end_matches('.').to_string();
                    }
                }
            }
            "mx" => {
                if let Ok(mxs) = lookup_mx(&args.domain) {
                    for (pref, host) in mxs {
                        let host = host.trim_end_matches('.');
                        if !host.is_empty() {
                            result.mx.push(format!("{host} (priority {pref})"));
                        }
                    }
                }
            }
            "ns" => {
                if let Ok(names) = lookup_names(&args.domain, TYPE_NS) {
                    for n in names {
                        let n = n.trim_end_matches('.');
                        if !n.is_empty() {
                            result.ns.push(n.to_string());
                        }
                    }
                }
            }
            "txt" => {
                if let Ok(txts) = lookup_txt(&args.domain) {
                    result.txt.extend(txts);
                }
            }
            other => return Err(anyhow!("unsupported record type: {other}")),
        }
    }

    if args.json {
        println!("{}", serde_json::to_string_pretty(&result)?);
    } else {
        println!("Domain: {}", result.domain);
        if !result.a.is_empty() {
            println!("A:      {}", result.a.join(", "));
        }
        if !result.aaaa.is_empty() {
            println!("AAAA:   {}", result.aaaa.join(", "));
        }
        if !result.cname.is_empty() {
            println!("CNAME:  {}", result.cname);
        }
        if !result.mx.is_empty() {
            println!("MX:     {}", result.mx.join(", "));
        }
        if !result.ns.is_empty() {
            println!("NS:     {}", result.ns.join(", "));
        }
        if !result.txt.is_empty() {
            println!("TXT:    {}", result.txt.join(", "));
        }
        if result.a.is_empty()
            && result.aaaa.is_empty()
            && result.cname.is_empty()
            && result.mx.is_empty()
            && result.ns.is_empty()
            && result.txt.is_empty()
        {
            println!("(no records found)");
        }
    }
    Ok(())
}

// ---- DNS wire format ----

fn nameservers() -> Vec<IpAddr> {
    let mut out = Vec::new();
    if let Ok(conf) = std::fs::read_to_string("/etc/resolv.conf") {
        for line in conf.lines() {
            if let Some(ns) = line.strip_prefix("nameserver") {
                if let Ok(ip) = ns.trim().parse::<IpAddr>() {
                    out.push(ip);
                }
            }
        }
    }
    if out.is_empty() {
        out.push(IpAddr::V4(Ipv4Addr::new(8, 8, 8, 8)));
    }
    out
}

fn encode_name(name: &str) -> Vec<u8> {
    let mut out = Vec::new();
    for label in name.trim_end_matches('.').split('.') {
        if label.is_empty() {
            continue;
        }
        out.push(label.len().min(63) as u8);
        out.extend_from_slice(&label.as_bytes()[..label.len().min(63)]);
    }
    out.push(0);
    out
}

fn build_query(domain: &str, qtype: u16) -> Vec<u8> {
    let id: u16 = rand::random();
    let mut pkt = Vec::with_capacity(512);
    pkt.extend_from_slice(&id.to_be_bytes());
    pkt.extend_from_slice(&0x0100u16.to_be_bytes()); // RD
    pkt.extend_from_slice(&1u16.to_be_bytes()); // QDCOUNT
    pkt.extend_from_slice(&0u16.to_be_bytes());
    pkt.extend_from_slice(&0u16.to_be_bytes());
    pkt.extend_from_slice(&0u16.to_be_bytes());
    pkt.extend_from_slice(&encode_name(domain));
    pkt.extend_from_slice(&qtype.to_be_bytes());
    pkt.extend_from_slice(&1u16.to_be_bytes()); // QCLASS IN
    pkt
}

/// Send a query and return the raw response packet.
fn exchange(domain: &str, qtype: u16) -> Result<Vec<u8>> {
    let pkt = build_query(domain, qtype);
    let mut last_err = anyhow!("no nameservers configured");
    for ns in nameservers() {
        let sock = match UdpSocket::bind("0.0.0.0:0") {
            Ok(s) => s,
            Err(e) => {
                last_err = anyhow!("{e}");
                continue;
            }
        };
        sock.set_read_timeout(Some(Duration::from_secs(5))).ok();
        let server = SocketAddr::new(ns, 53);
        if sock.send_to(&pkt, server).is_err() {
            last_err = anyhow!("send to {server} failed");
            continue;
        }
        let mut buf = [0u8; 4096];
        match sock.recv_from(&mut buf) {
            Ok((n, _)) => return Ok(buf[..n].to_vec()),
            Err(e) => last_err = anyhow!("dns {server}: {e}"),
        }
    }
    Err(last_err)
}

struct Packet<'a> {
    buf: &'a [u8],
    pos: usize,
}

impl<'a> Packet<'a> {
    fn u16(&mut self) -> Option<u16> {
        let v = u16::from_be_bytes([*self.buf.get(self.pos)?, *self.buf.get(self.pos + 1)?]);
        self.pos += 2;
        Some(v)
    }
    fn u32(&mut self) -> Option<u32> {
        let v = u32::from_be_bytes([
            *self.buf.get(self.pos)?,
            *self.buf.get(self.pos + 1)?,
            *self.buf.get(self.pos + 2)?,
            *self.buf.get(self.pos + 3)?,
        ]);
        self.pos += 4;
        Some(v)
    }
    fn take(&mut self, n: usize) -> Option<&'a [u8]> {
        let s = self.buf.get(self.pos..self.pos + n)?;
        self.pos += n;
        Some(s)
    }
    /// Read a domain name, following compression pointers (max 128 hops).
    /// `end` tracks how many bytes the name occupies at the original position.
    fn name(&mut self) -> Option<String> {
        let mut labels = Vec::new();
        let mut pos = self.pos;
        let mut jumped = false;
        let mut end = self.pos;
        let mut hops = 0usize;
        loop {
            hops += 1;
            if hops > 128 {
                return None;
            }
            let len = *self.buf.get(pos)? as usize;
            if len & 0xC0 == 0xC0 {
                if !jumped {
                    end = pos + 2;
                    jumped = true;
                }
                let off = ((len & 0x3F) << 8) | (*self.buf.get(pos + 1)? as usize);
                pos = off;
                continue;
            }
            if len == 0 {
                if !jumped {
                    end = pos + 1;
                }
                break;
            }
            pos += 1;
            let label = self.buf.get(pos..pos + len)?;
            labels.push(String::from_utf8_lossy(label).into_owned());
            pos += len;
        }
        self.pos = end;
        Some(labels.join("."))
    }
    /// Parse header + questions, returning answer (type, rdata-range) pairs.
    fn answers(&mut self) -> Vec<(u16, usize, usize)> {
        let mut out = Vec::new();
        let _id = self.u16();
        let _flags = self.u16();
        let qd = self.u16().unwrap_or(0) as usize;
        let an = self.u16().unwrap_or(0) as usize;
        let _ns_count = self.u16();
        let _ar = self.u16();
        for _ in 0..qd {
            self.name();
            self.u16();
            self.u16();
        }
        for _ in 0..an {
            self.name();
            let Some(atype) = self.u16() else { break };
            self.u16(); // class
            self.u32(); // ttl
            let Some(rdlen) = self.u16().map(|v| v as usize) else {
                break;
            };
            let start = self.pos;
            if self.take(rdlen).is_none() {
                break;
            }
            out.push((atype, start, self.pos));
        }
        out
    }
}

/// Parse all answers of `qtype` from a response packet.
fn parse_answers(packet: &[u8], qtype: u16) -> Vec<(u16, usize, usize)> {
    let mut p = Packet {
        buf: packet,
        pos: 0,
    };
    p.answers()
        .into_iter()
        .filter(|(t, _, _)| *t == qtype)
        .collect()
}

fn lookup(domain: &str, qtype: u16) -> Result<Vec<IpAddr>> {
    let packet = exchange(domain, qtype)?;
    let mut out = Vec::new();
    for (_, start, end) in parse_answers(&packet, qtype) {
        let rdata = &packet[start..end];
        match qtype {
            TYPE_A if rdata.len() == 4 => {
                out.push(IpAddr::V4(Ipv4Addr::new(
                    rdata[0], rdata[1], rdata[2], rdata[3],
                )));
            }
            TYPE_AAAA if rdata.len() == 16 => {
                let mut o = [0u8; 16];
                o.copy_from_slice(rdata);
                out.push(IpAddr::V6(Ipv6Addr::from(o)));
            }
            _ => {}
        }
    }
    Ok(out)
}

/// Name-valued records (CNAME, NS): rdata is a (possibly compressed) name.
fn lookup_names(domain: &str, qtype: u16) -> Result<Vec<String>> {
    let packet = exchange(domain, qtype)?;
    let mut out = Vec::new();
    for (_, start, _) in parse_answers(&packet, qtype) {
        let mut p = Packet {
            buf: &packet,
            pos: start,
        };
        if let Some(name) = p.name() {
            out.push(name);
        }
    }
    Ok(out)
}

fn lookup_mx(domain: &str) -> Result<Vec<(u16, String)>> {
    let packet = exchange(domain, TYPE_MX)?;
    let mut out = Vec::new();
    for (_, start, _) in parse_answers(&packet, TYPE_MX) {
        // rdata: 2-byte preference + name
        if start + 2 > packet.len() {
            continue;
        }
        let pref = u16::from_be_bytes([packet[start], packet[start + 1]]);
        let mut p = Packet {
            buf: &packet,
            pos: start + 2,
        };
        if let Some(name) = p.name() {
            out.push((pref, name));
        }
    }
    Ok(out)
}

fn lookup_txt(domain: &str) -> Result<Vec<String>> {
    let packet = exchange(domain, TYPE_TXT)?;
    let mut out = Vec::new();
    for (_, start, end) in parse_answers(&packet, TYPE_TXT) {
        let rdata = &packet[start..end];
        let mut pos = 0usize;
        let mut parts = Vec::new();
        while pos < rdata.len() {
            let len = rdata[pos] as usize;
            pos += 1;
            if pos + len > rdata.len() {
                break;
            }
            parts.push(String::from_utf8_lossy(&rdata[pos..pos + len]).to_string());
            pos += len;
        }
        if !parts.is_empty() {
            out.push(parts.concat());
        }
    }
    Ok(out)
}
