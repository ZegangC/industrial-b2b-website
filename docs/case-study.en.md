# Turning an industrial buyer journey into a reliable inquiry path

[中文案例](case-study.md) · About 4 minutes · Retrospective updated 21 October 2026

## Overview

This project is a locally reviewable industrial B2B website. My role involved business requirements and source materials, scope discussions, review feedback and iteration. AI tools supported implementation and documentation. I do not present this work as a live growth launch or claim a formal product team that has not been established in the records.

The local iteration records date from 10–13 October 2026; the sanitized repository was prepared on 15 October. The public deliverable is a case study with selected executable inquiry and document-access rules, rather than the full business website.

## Problem

The business wanted to receive visitors from social media, search, advertising and sales sharing in a consistent product and company information hub. Buyers may need to assess the supplier, find a material, compare technical information, or request help.

These were business goals and buyer-task hypotheses. Without baseline analytics or buyer research, an attractive redesign could not establish that the previous website converted poorly or that the new one would produce more inquiries.

## Process and decisions

Requirements evolved toward distributor-first navigation, priority materials and applications, multilingual content and evidence-backed company information. I supplied and reviewed business inputs and participated in scope and content reviews, with AI-assisted implementation.

The project examined existing company materials and peer-site information structures. This informed product, application and document paths; it did not substitute for observing actual buyers.

Three decisions are central to the case:

1. Multiple calls to action use one inquiry form with product, language and source context. This reduces fragmented handling, but requires context-preservation tests.
2. A successful HTTP response alone does not establish receipt. Success requires a matching submission ID and an explicit stored receipt. Production storage, deduplication and sales notification still require integration.
3. Deliver product information and human handoff before adding an AI chatbot or a bespoke CRM. Document gating also creates friction and needs buyer validation; its existence does not prove commercial value.

These decisions are a retrospective account of the project. I distinguish business requests, personal input and AI-generated proposals rather than attributing every decision to myself.

## Solution

The local business build includes English, Chinese and Portuguese pages, product-family search and filters, two priority-material comparisons, company and technical content, a shared form and TDS requests. Translation implementation is distinct from professional market and technical-language review.

The public demo uses synthetic input and in-memory receiver responses. It tests missing configuration, HTTP 200 without storage confirmation, and a matching receipt. It also provides selected signing and local-storage rules. It does not send sales email or serve the complete website.

With Node.js 22.6+, run `npm run demo` and `npm test` from the repository root. The selected modules need no third-party packages.

## Results

The v0.17 acceptance record dated 13 October reports 171 content pages across three languages and 17 product families. These are content and template counts, not traffic or conversion. Eighteen original-project rule tests were rerun during the 15 October review; the public repository has its own smaller test scope.

Production receipt and notification remain unintegrated. Live acquisition, ranking, revenue and AI-chatbot outcomes have not been established. See the [evidence map](evidence-map.md) and [implementation scope](implementation-scope.md).

## Learnings

I would observe representative buyer tasks earlier and measure where people struggle before expanding page volume. Next steps are small task-based studies, real receipt integration, and separate tracking of saved requests, sales qualification, human replies and orders. A future AI assistant needs reviewed knowledge, a handoff path and evidence of service demand.
