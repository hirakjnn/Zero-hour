# Challenge: Disaster Sheet - CSV Cleanup Script

## Background
We receive daily reports of server anomalies in CSV format. Unfortunately, the format is often messy, containing empty lines, missing columns, and inconsistent casing.

## Problem
The `clean.py` script was written to parse these CSV files and produce a cleaned-up version. However, it currently crashes with an `IndexError` when it encounters a row missing expected columns, and it doesn't filter out completely empty rows correctly.

## Your Task
Fix `clean.py` to:
1. Ignore empty rows completely.
2. Handle rows with missing columns gracefully by padding missing values with `"UNKNOWN"`.
3. Ensure the 'Severity' column (the third column) is always capitalized (e.g., `"High"`, `"Low"`).

## Run the script
`python clean.py`
