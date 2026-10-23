# Post Specification

This document defines the standard structure for every Instagram carousel post.

The goal is to produce educational, highly shareable carousels that are easy to
read, visually consistent, and easy to convert into design templates.

---

## Table of Contents

- [Post Specification](#post-specification)
  - [Table of Contents](#table-of-contents)
  - [Objectives](#objectives)
  - [General Rules](#general-rules)
  - [Recommended Structure](#recommended-structure)
    - [1. Cover \& Hook](#1-cover--hook)
    - [2. The Short Answer (Main Claim) + Roadmap](#2-the-short-answer-main-claim--roadmap)
    - [3. Background / Why This Matters](#3-background--why-this-matters)
    - [4. Evidence 1](#4-evidence-1)
    - [5. Evidence 2](#5-evidence-2)
    - [6. Evidence 3](#6-evidence-3)
    - [7. Counterarguments, Limitations, or Alternative Explanations](#7-counterarguments-limitations-or-alternative-explanations)
    - [8. Conclusion \& Key Takeaways](#8-conclusion--key-takeaways)
    - [9. References](#9-references)
    - [10. Discussion / Q\&A](#10-discussion--qa)
  - [Slide Count](#slide-count)
  - [Writing Style](#writing-style)
  - [Hook Guidelines](#hook-guidelines)
  - [Text Limits](#text-limits)
    - [Cover](#cover)
    - [Content Slide](#content-slide)
    - [Summary](#summary)
    - [Question Slide](#question-slide)
  - [Visual Guidelines](#visual-guidelines)
  - [Choosing Templates](#choosing-templates)
  - [Clarification Rules (Read First)](#clarification-rules-read-first)
    - [Information to Confirm](#information-to-confirm)
      - [Topic](#topic)
      - [Audience](#audience)
      - [Goal](#goal)
      - [Scope](#scope)
      - [Constraints](#constraints)
    - [Default Questions](#default-questions)
    - [Never Assume](#never-assume)
    - [Generation Gate](#generation-gate)
  - [AI Workflow](#ai-workflow)
    - [Step 1](#step-1)
    - [Step 2](#step-2)
    - [Step 3](#step-3)
  - [Quality Checklist](#quality-checklist)
  - [Success Criteria](#success-criteria)

---

## Objectives

Every post should aim to:

- Teach **one** idea.
- Solve **one** problem.
- Be understandable in under 60 seconds.
- Encourage saves and shares.
- Encourage discussion at the end.
- Be visually simple.

---

## General Rules

- Maximum **10 slides**.
- Minimum **4 slides**.
- One topic per carousel.
- One key idea per slide.
- Never overload a slide with text.
- Use simple language.
- Prefer examples over definitions.
- Avoid unnecessary jargon.
- Every slide should be understandable without reading the caption.

---

## Recommended Structure

### 1. Cover & Hook

Introduce the topic with a compelling question, statement, or surprising fact to
capture the audience's attention.

Purpose:

- Grab attention.
- Make people stop scrolling.

Contains:

- Large headline
- Small supporting subtitle (optional)
- Relevant illustration/icon/image

Examples

✓ Git in 5 Minutes

✓ Why Your Brain Forgets Things

✓ Node.js vs Bun

Never:

- Long paragraphs
- Tiny text
- Multiple ideas

---

### 2. The Short Answer (Main Claim) + Roadmap

Present the main takeaway or thesis early, followed by a brief overview of what
will be covered.

Goal:

Make readers want to continue.

---

### 3. Background / Why This Matters

Provide the necessary context, define key concepts, and explain the significance
of the topic.

Explain:

- Why this topic matters
- The problem
- The misconception

---

### 4. Evidence 1

Present the first key piece of evidence, explain its meaning, and connect it to
the main claim.

---

### 5. Evidence 2

Present the second key piece of evidence, interpret the findings, and explain
how it strengthens the argument.

---

### 6. Evidence 3

Present the third key piece of evidence, discuss its implications, and reinforce
the overall message.

Possible formats for Evidence 1–3:

- explanation
- comparison
- checklist
- timeline
- diagram
- chart
- example
- code snippet
- illustration
- myth vs fact
- pros & cons
- step-by-step

Each slide should contain exactly ONE idea. Avoid putting more than one major
concept on a slide.

---

### 7. Counterarguments, Limitations, or Alternative Explanations

Acknowledge uncertainties, competing explanations, or limitations of the
evidence, and explain why the main conclusion remains supported.

---

### 8. Conclusion & Key Takeaways

Summarize the main findings, answer the original question, and leave the
audience with the most important takeaway.

Possible formats:

- Key Takeaways
- Cheat Sheet
- Remember This
- Quick Recap

Reader should remember the whole post after this slide.

---

### 9. References

List all sources cited in the presentation using the appropriate citation style.

Purpose:

- Provide sources for further reading.
- Build credibility.
- Allow readers to explore deeper.

Contains:

- List of references with author, title, year, and URL.
- Use the References template.

---

### 10. Discussion / Q&A

Invite questions, encourage discussion, and address any remaining points of
clarification.

Examples:

- Which one do you prefer?
- Have you experienced this?
- What topic should I explain next?
- What's your biggest challenge?
- Agree or disagree?

Avoid fake engagement bait.

Good:

> Which runtime would you choose for your next project?

Bad:

> COMMENT YES IF YOU AGREE!!

---

## Slide Count

Recommended

1. Cover
2. Introduction
3. Content
4. Content
5. Content
6. Content
7. Content
8. Summary
9. References
10. Discussion

Smaller posts

1. Cover
2. Introduction
3. Content
4. Content
5. Summary
6. Discussion

---

## Writing Style

Use:

- Short sentences
- Active voice
- Everyday language
- Bullet points
- Clear headings

Avoid:

- Walls of text
- Academic writing
- Long paragraphs
- Clickbait
- AI buzzwords

---

## Hook Guidelines

Good hooks:

- Why ...
- How ...
- The Truth About ...
- X Mistakes ...
- X Things Everyone Gets Wrong
- Beginner's Guide
- Explained Simply

Examples

- Why Docker Isn't a Virtual Machine
- 5 Memory Myths
- Git Explained Simply
- What Actually Happens When You Learn

---

## Text Limits

### Cover

Headline:

≤ 8 words

Subtitle:

≤ 15 words

---

### Content Slide

Headline:

≤ 8 words

Body:

40–80 words preferred

Bullet lists:

3–7 bullets

---

### Summary

Maximum:

5 bullets

---

### Question Slide

One question only.

Optional supporting sentence.

---

## Visual Guidelines

Each slide should have:

- one visual focus
- plenty of whitespace
- consistent typography
- consistent spacing

Prefer:

- icons
- illustrations
- diagrams
- charts
- screenshots
- code blocks
- comparison tables

Avoid decorative clutter.

---

## Choosing Templates

The design renderer uses templates defined in `templates.md`.

When generating a carousel:

1. Choose the template that best communicates the information.
2. Do NOT force every slide into the same template.
3. Different slides may use different templates.
4. Select the simplest template that communicates the idea.

Examples

Cover

- highlighted-title
- gradient-text
- minimal

Checklist

- checklist

Comparison

- comparison
- versus
- pros-cons

Timeline

- timeline

Statistics

- data-stats
- stat-row
- donut-chart

Code

- code
- terminal

Architecture

- architecture-diagram
- dependency-graph

Research

- methods
- participants
- results

Question

- poll-vote
- discussion
- this-or-that

---

## Clarification Rules (Read First)

Before generating any content, the AI **must not make assumptions**.

If any required information is missing or ambiguous, the AI should stop and ask
clarifying questions first.

Do **not** generate outlines, slides, YAML, images, or templates until the
required questions have been answered.

### Information to Confirm

Depending on the request, ask about:

#### Topic

- What is the exact topic?
- Is there a specific angle or audience?

#### Audience

Examples:

- Beginners
- Intermediate developers
- Professionals
- Students
- General public

#### Goal

Ask what the post should optimize for.

Examples:

- Education
- Awareness
- Saveable reference
- Shareability
- Discussion
- Promotion

#### Scope

Clarify the expected depth.

Examples:

- Beginner overview
- Deep dive
- Comparison
- Step-by-step
- Common mistakes
- Cheat sheet

#### Constraints

If applicable, ask about:

- Maximum number of slides
- Required templates
- Brand colors
- Tone of voice
- Required references
- Required diagrams
- Required code examples

---

### Default Questions

If no information is provided, ask these questions before generating anything.

1. What topic should this carousel cover?
2. Who is the target audience?
3. What is the primary goal of the post?
4. Is there a preferred style or angle?
5. Are there any required templates, diagrams, or visuals?

Wait for the user's answers before continuing.

---

### Never Assume

Do **not** assume:

- the audience
- the desired complexity
- the number of slides
- the templates
- the visual style
- the tone
- the call-to-action
- the discussion question

Always ask if uncertain.

---

### Generation Gate

Only begin generating the carousel after:

- All required questions have been answered.
- The topic is clearly defined.
- The target audience is known.
- The goal is understood.
- Any additional constraints are confirmed.

If any of these are missing, ask questions instead of generating content.

## AI Workflow

The workflow consists of two files.

### Step 1

Provide this document (`posts.md`) together with the topic.

Example

Topic:

Why Docker Exists

---

### Step 2

Provide `templates.md`.

The AI should read the available templates and choose the most appropriate
template for each slide.

---

### Step 3

The AI returns **only YAML**.

Each YAML object represents one slide.

Example

```yaml
# Post 1 (Highlighted Title)
highlighted-title:
  headline: Why Docker Exists
  text: Containers made deployment predictable.

---
# Post 2 (Checklist)
checklist:
  headline: Problems Docker Solves
  items:
    - Works on my machine
    - Dependency conflicts
    - Environment drift
```

The object needs to match the schema of the selected template in `templates.md`.

Do not invent fields.

Do not omit required fields.

---

## Quality Checklist

Before returning the YAML, verify:

- Topic stays focused on one idea.
- Maximum 10 slides.
- First slide is a hook.
- Last slide asks a genuine discussion question.
- Every slide teaches one concept.
- No repeated information.
- Appropriate templates chosen.
- Content matches template schema exactly.
- YAML is valid.
- Grammar and spelling are correct.
- Visual variety across slides.
- Easy for beginners to understand.
- Encourages saves and shares.

---

## Success Criteria

A successful carousel should make readers:

- Stop scrolling.
- Swipe to the end.
- Learn something useful.
- Save the post.
- Share it with a friend.
- Leave a meaningful comment.
