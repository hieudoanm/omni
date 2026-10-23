use anyhow::Result;
use std::io::Read;
use std::time::Duration;

fn agent() -> ureq::Agent {
    ureq::Agent::config_builder()
        .timeout_global(Some(Duration::from_secs(15)))
        .build()
        .into()
}

/// GET request returning the raw response body (mirrors libs/requests.Get).
pub fn get(url: &str) -> Result<Vec<u8>> {
    let mut resp = agent().get(url).call()?;
    let mut buf = Vec::new();
    resp.body_mut().as_reader().read_to_end(&mut buf)?;
    Ok(buf)
}

/// GET request returning the body as a String.
#[allow(dead_code)]
pub fn get_string(url: &str) -> Result<String> {
    Ok(String::from_utf8_lossy(&get(url)?).into_owned())
}

/// POST a JSON body with an optional bearer token; returns the raw response body.
pub fn post_json(url: &str, bearer_token: &str, body: &serde_json::Value) -> Result<Vec<u8>> {
    let mut req = agent().post(url).header("Content-Type", "application/json");
    if !bearer_token.is_empty() {
        req = req.header("Authorization", &format!("Bearer {bearer_token}"));
    }
    let mut resp = req.send_json(body)?;
    let mut buf = Vec::new();
    resp.body_mut().as_reader().read_to_end(&mut buf)?;
    Ok(buf)
}

/// Generic request mirroring libs/requests.Options{Body, Header}.
/// Supports GET/POST/PUT/DELETE with an optional byte body and headers.
pub fn request(
    method: &str,
    url: &str,
    body: Option<&[u8]>,
    headers: &[(String, String)],
) -> Result<Vec<u8>> {
    let agent = agent();
    let mut resp = match method.to_uppercase().as_str() {
        "GET" => {
            let mut req = agent.get(url);
            for (k, v) in headers {
                req = req.header(k.as_str(), v.as_str());
            }
            req.call()?
        }
        "POST" => {
            let mut req = agent.post(url);
            for (k, v) in headers {
                req = req.header(k.as_str(), v.as_str());
            }
            req.send(body.unwrap_or(&[]))?
        }
        "PUT" => {
            let mut req = agent.put(url);
            for (k, v) in headers {
                req = req.header(k.as_str(), v.as_str());
            }
            req.send(body.unwrap_or(&[]))?
        }
        "DELETE" => {
            let mut req = agent.delete(url);
            for (k, v) in headers {
                req = req.header(k.as_str(), v.as_str());
            }
            req.call()?
        }
        m => anyhow::bail!("unsupported method: {m}"),
    };
    let mut buf = Vec::new();
    resp.body_mut().as_reader().read_to_end(&mut buf)?;
    Ok(buf)
}

/// Like `request` but returns (status, body). 4xx/5xx are returned, not errors.
pub fn request_status(
    method: &str,
    url: &str,
    body: Option<&[u8]>,
    headers: &[(String, String)],
) -> Result<(u16, Vec<u8>)> {
    let agent = ureq::Agent::config_builder()
        .timeout_global(Some(std::time::Duration::from_secs(30)))
        .http_status_as_error(false)
        .build()
        .new_agent();
    let mut resp = match method.to_uppercase().as_str() {
        "GET" => {
            let mut req = agent.get(url);
            for (k, v) in headers {
                req = req.header(k.as_str(), v.as_str());
            }
            req.call()?
        }
        "POST" => {
            let mut req = agent.post(url);
            for (k, v) in headers {
                req = req.header(k.as_str(), v.as_str());
            }
            req.send(body.unwrap_or(&[]))?
        }
        "PUT" => {
            let mut req = agent.put(url);
            for (k, v) in headers {
                req = req.header(k.as_str(), v.as_str());
            }
            req.send(body.unwrap_or(&[]))?
        }
        "DELETE" => {
            let mut req = agent.delete(url);
            for (k, v) in headers {
                req = req.header(k.as_str(), v.as_str());
            }
            req.call()?
        }
        m => anyhow::bail!("unsupported method: {m}"),
    };
    let status = resp.status().as_u16();
    let mut buf = Vec::new();
    resp.body_mut().as_reader().read_to_end(&mut buf)?;
    Ok((status, buf))
}
