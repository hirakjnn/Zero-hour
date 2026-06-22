import csv
import io

# Mock raw CSV data containing bad formatting
RAW_CSV_DATA = """ServerID,Incident,Severity
SRV-001,CPU Spike,high

SRV-002,Memory Leak,CRITICAL
SRV-003,Disk Full
SRV-004,Network Drop,low
"""

def clean_csv(raw_data):
    # Read the raw data
    reader = csv.reader(io.StringIO(raw_data.strip()))
    header = next(reader)
    
    cleaned_rows = []
    cleaned_rows.append(header)
    
    for row in reader:
        # BUG: Fails on empty rows or rows with missing columns
        # TODO: Ignore empty rows
        # TODO: Pad missing columns with "UNKNOWN"
        # TODO: Capitalize severity (e.g. "High", "Critical", "Low")
        
        server_id = row[0].strip()
        incident = row[1].strip()
        severity = row[2].strip().capitalize()
        
        cleaned_rows.append([server_id, incident, severity])
        
    return cleaned_rows

if __name__ == "__main__":
    try:
        results = clean_csv(RAW_CSV_DATA)
        for r in results:
            print(",".join(r))
    except Exception as e:
        print(f"Error occurred during processing: {e}")
