# Challenge: Corpus Haven - Deterministic Ingestion

## Background
We process a large amount of domain-mixed text data for training our AI models. It is crucial that our ingestion pipeline is deterministic, meaning that processing the same input twice must yield the exact same output.

## Problem
Our current ingestion pipeline, found in `pipeline.py`, reads a set of text files and normalizes them. However, it seems to be generating different results on different runs when outputting the final token frequencies, which ruins our deterministic guarantees.

## Your Task
Fix `pipeline.py` so that:
1. The ingestion process is fully deterministic. 
2. The output token frequencies are always ordered descending by frequency. For tokens with the exact same frequency, they should be sorted alphabetically.
3. Remove any sources of randomness or non-determinism in the code.

## Run the pipeline
`python pipeline.py`
