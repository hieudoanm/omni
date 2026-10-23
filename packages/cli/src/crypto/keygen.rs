use anyhow::{anyhow, Result};
use clap::Args;
use rsa::rand_core as rc10;
use std::convert::Infallible;

/// CSPRNG adapter: rand 0.10 SysRng behind the rand_core 0.10 traits used by
/// rsa/ecdsa/ed25519-dalek 3.x.
struct OsRng10(rand::rngs::SysRng);

impl rc10::TryRng for OsRng10 {
    type Error = Infallible;
    fn try_next_u32(&mut self) -> Result<u32, Infallible> {
        self.0
            .try_next_u32()
            .map_err(|_| unreachable!("os rng failure is unrecoverable"))
    }
    fn try_next_u64(&mut self) -> Result<u64, Infallible> {
        self.0
            .try_next_u64()
            .map_err(|_| unreachable!("os rng failure is unrecoverable"))
    }
    fn try_fill_bytes(&mut self, dst: &mut [u8]) -> Result<(), Infallible> {
        self.0
            .try_fill_bytes(dst)
            .map_err(|_| unreachable!("os rng failure is unrecoverable"))
    }
}

impl rc10::TryCryptoRng for OsRng10 {}

#[derive(Args)]
pub struct KeygenArgs {
    /// Key algorithm (rsa, ecdsa, ed25519)
    #[arg(long, short = 'a', default_value = "ed25519")]
    pub algorithm: String,
    /// Key size (bits): 2048/4096 for rsa, 256/384/521 for ecdsa
    #[arg(long, short = 'b', default_value_t = 256)]
    pub bits: u32,
    /// Output file path
    #[arg(long, short = 'o', default_value = "id_rsa")]
    pub output: String,
}

fn write_keys(priv_pem: String, pub_pem: String, path: &str) -> Result<()> {
    if let Some(dir) = std::path::Path::new(path).parent() {
        if !dir.as_os_str().is_empty() {
            std::fs::create_dir_all(dir)?;
        }
    }
    std::fs::write(path, priv_pem)?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o600));
    }
    std::fs::write(format!("{path}.pub"), pub_pem)?;
    let abs = std::fs::canonicalize(path).unwrap_or_else(|_| path.into());
    println!("Wrote {}", abs.display());
    println!("Wrote {}.pub", abs.display());
    Ok(())
}

fn gen_rsa(bits: u32, path: &str) -> Result<()> {
    if bits != 2048 && bits != 4096 {
        return Err(anyhow!("rsa key size must be 2048 or 4096"));
    }
    use rsa::pkcs8::{EncodePrivateKey, EncodePublicKey, LineEnding};
    let mut rng = OsRng10(rand::rngs::SysRng);
    let key = rsa::PrivateKey::new(&mut rng, bits as usize)
        .map_err(|e| anyhow!("generate rsa key: {e}"))?;
    let priv_pem = key
        .to_pkcs8_pem(LineEnding::LF)
        .map_err(|e| anyhow!("{e}"))?
        .to_string();
    let pub_key = rsa::PublicKey::from(&key);
    let pub_pem = pub_key
        .to_public_key_pem(LineEnding::LF)
        .map_err(|e| anyhow!("{e}"))?
        .to_string();
    write_keys(priv_pem, pub_pem, path)
}

macro_rules! gen_curve {
    ($sk:ty, $path:expr) => {{
        use pkcs8::{EncodePrivateKey, LineEnding};
        use spki::EncodePublicKey;
        let mut rng = OsRng10(rand::rngs::SysRng);
        let sk = <$sk as elliptic_curve::Generate>::try_generate_from_rng(&mut rng)
            .map_err(|e| anyhow!("{e:?}"))?;
        let vk = sk.verifying_key();
        let priv_pem = sk
            .to_pkcs8_pem(LineEnding::LF)
            .map_err(|e| anyhow!("{e}"))?
            .to_string();
        let pub_pem = vk
            .to_public_key_pem(LineEnding::LF)
            .map_err(|e| anyhow!("{e}"))?
            .to_string();
        write_keys(priv_pem, pub_pem, $path)
    }};
}

fn gen_ecdsa(bits: u32, path: &str) -> Result<()> {
    match bits {
        256 => gen_curve!(p256::ecdsa::SigningKey, path),
        384 => gen_curve!(p384::ecdsa::SigningKey, path),
        521 => gen_curve!(p521::ecdsa::SigningKey, path),
        _ => Err(anyhow!("ecdsa key size must be 256, 384, or 521")),
    }
}

fn gen_ed25519(path: &str) -> Result<()> {
    use ed25519_dalek::SigningKey;
    use pkcs8::{EncodePrivateKey, LineEnding};
    use spki::EncodePublicKey;
    let mut rng = OsRng10(rand::rngs::SysRng);
    let sk = SigningKey::generate(&mut rng);
    let vk = sk.verifying_key();
    let priv_pem = sk
        .to_pkcs8_pem(LineEnding::LF)
        .map_err(|e| anyhow!("{e}"))?
        .to_string();
    let pub_pem = vk
        .to_public_key_pem(LineEnding::LF)
        .map_err(|e| anyhow!("{e}"))?
        .to_string();
    write_keys(priv_pem, pub_pem, path)
}

pub fn run(args: &KeygenArgs, json: bool) -> Result<()> {
    match args.algorithm.as_str() {
        "rsa" => gen_rsa(args.bits, &args.output)?,
        "ecdsa" => gen_ecdsa(args.bits, &args.output)?,
        "ed25519" => gen_ed25519(&args.output)?,
        other => {
            return Err(anyhow!(
                "unsupported algorithm: {other} (use rsa, ecdsa, or ed25519)"
            ))
        }
    }
    if json {
        let abs =
            std::fs::canonicalize(&args.output).unwrap_or_else(|_| args.output.clone().into());
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "algorithm": args.algorithm, "bits": args.bits,
                "private_key": abs, "public_key": format!("{}.pub", abs.display()),
            }))?
        );
    }
    Ok(())
}
