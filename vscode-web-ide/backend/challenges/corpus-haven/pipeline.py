import collections
import string

def ingest_text(text):
    # Convert text to lower case and remove punctuation
    text = text.lower()
    for p in string.punctuation:
        text = text.replace(p, ' ')
        
    tokens = text.split()
    return tokens

def get_token_frequencies(texts):
    # Note: Sets and dictionaries in some Python versions/configurations
    # might not preserve order, but collections.Counter does retain insertion order.
    # However, we need a specific sorted output to guarantee determinism.
    
    combined_tokens = []
    # There is a bug here where texts are processed as a set, losing ordering
    # For determinism, we need to process them in a stable order.
    # But for frequencies, the order of ingestion shouldn't matter as long as sorting is correct.
    for text in set(texts): 
        combined_tokens.extend(ingest_text(text))
        
    freq = collections.Counter(combined_tokens)
    
    # TODO: Fix the sorting so that it is strictly deterministic
    # Primary sort: frequency (descending)
    # Secondary sort: alphabetical (ascending)
    # Currently just sorting by frequency
    sorted_freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    
    return sorted_freq

if __name__ == "__main__":
    sample_texts = [
        "The quick brown fox jumps over the lazy dog.",
        "A quick brown dog outpaces a fast fox.",
        "Dogs and foxes are animals."
    ]
    
    result = get_token_frequencies(sample_texts)
    print("Token Frequencies:")
    for token, count in result:
        print(f"{token}: {count}")
