use super::graph::{EdgeKind, Graph, NodeKind};
use quick_xml::events::{BytesEnd, BytesStart, BytesText, Event};
use quick_xml::Writer;
use std::fs::File as FsFile;
use std::io::{BufWriter, Write};

pub fn write(g: &Graph, path: &str) -> anyhow::Result<()> {
    let f = FsFile::create(path)?;
    let mut w = Writer::new_with_indent(BufWriter::new(f), b' ', 2);

    w.write_event(Event::Decl(quick_xml::events::BytesDecl::new(
        "1.0",
        Some("UTF-8"),
        None,
    )))?;

    let mut root = BytesStart::new("graphml");
    root.push_attribute(("xmlns", "http://graphml.graphdrawing.org/xmlns"));
    root.push_attribute(("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance"));
    root.push_attribute((
        "xsi:schemaLocation",
        "http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd",
    ));
    w.write_event(Event::Start(root))?;

    let keys: [(&str, &str, &str, &str); 10] = [
        ("g_generated", "graph", "generated", "string"),
        ("g_version", "graph", "version", "string"),
        ("d_kind", "node", "kind", "string"),
        ("d_label", "node", "label", "string"),
        ("d_file", "node", "file", "string"),
        ("d_line", "node", "line", "int"),
        ("d_lang", "node", "lang", "string"),
        ("d_exported", "node", "exported", "boolean"),
        ("e_kind", "edge", "kind", "string"),
        ("e_line", "edge", "line", "int"),
    ];
    for (id, for_, name, ty) in keys {
        let mut k = BytesStart::new("key");
        k.push_attribute(("id", id));
        k.push_attribute(("for", for_));
        k.push_attribute(("attr.name", name));
        k.push_attribute(("attr.type", ty));
        w.write_event(Event::Empty(k))?;
    }

    let mut graph = BytesStart::new("graph");
    graph.push_attribute(("id", "G"));
    graph.push_attribute(("edgedefault", "directed"));
    w.write_event(Event::Start(graph))?;

    let now = chrono::Utc::now().to_rfc3339();
    write_data(&mut w, "g_generated", &now)?;
    write_data(&mut w, "g_version", "1")?;

    for n in &g.nodes {
        let mut node = BytesStart::new("node");
        node.push_attribute(("id", n.id.as_str()));
        w.write_event(Event::Start(node))?;
        write_data(&mut w, "d_kind", kind_str(n.kind))?;
        write_data(&mut w, "d_label", &n.label)?;
        write_data(&mut w, "d_file", &n.file)?;
        write_data(&mut w, "d_line", &n.line.to_string())?;
        write_data(&mut w, "d_lang", &n.lang)?;
        write_data(
            &mut w,
            "d_exported",
            if n.exported { "true" } else { "false" },
        )?;
        w.write_event(Event::End(BytesEnd::new("node")))?;
    }

    for e in &g.edges {
        let mut edge = BytesStart::new("edge");
        edge.push_attribute(("id", e.id.as_str()));
        edge.push_attribute(("source", e.source.as_str()));
        edge.push_attribute(("target", e.target.as_str()));
        w.write_event(Event::Start(edge))?;
        write_data(
            &mut w,
            "e_kind",
            match e.kind {
                EdgeKind::Contains => "contains",
                EdgeKind::Calls => "calls",
            },
        )?;
        write_data(&mut w, "e_line", &e.line.to_string())?;
        w.write_event(Event::End(BytesEnd::new("edge")))?;
    }

    w.write_event(Event::End(BytesEnd::new("graph")))?;
    w.write_event(Event::End(BytesEnd::new("graphml")))?;
    w.get_mut().flush()?;
    Ok(())
}

fn kind_str(k: NodeKind) -> &'static str {
    k.as_str()
}

fn write_data<W: Write>(w: &mut Writer<W>, key: &str, value: &str) -> quick_xml::Result<()> {
    let mut d = BytesStart::new("data");
    d.push_attribute(("key", key));
    w.write_event(Event::Start(d))?;
    w.write_event(Event::Text(BytesText::new(value)))?;
    w.write_event(Event::End(BytesEnd::new("data")))?;
    Ok(())
}
