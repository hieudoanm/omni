//! Shared crypto helpers.
use anyhow::{anyhow, Result};
use sha2::{Digest, Sha256};

pub fn compute_hash(input: &[u8], algorithm: &str) -> Result<String> {
    Ok(match algorithm.to_lowercase().as_str() {
        "md5" => hex::encode(md5::Md5::digest(input)),
        "sha1" => hex::encode(sha1::Sha1::digest(input)),
        "sha256" => hex::encode(Sha256::digest(input)),
        "sha512" => hex::encode(sha2::Sha512::digest(input)),
        other => return Err(anyhow!("unknown algorithm: {other}")),
    })
}

/// Uniform random index in [0, n) using a CSPRNG (crypto/rand.Int parity).
pub fn rand_index(n: usize) -> Result<usize> {
    use rand::Rng;
    if n == 0 {
        return Err(anyhow!("empty range"));
    }
    // rejection sampling to avoid modulo bias
    let zone = u32::MAX - (u32::MAX % n as u32);
    let mut buf = [0u8; 4];
    loop {
        rand::rng().fill_bytes(&mut buf);
        let v = u32::from_le_bytes(buf);
        if v < zone {
            return Ok((v % n as u32) as usize);
        }
    }
}
