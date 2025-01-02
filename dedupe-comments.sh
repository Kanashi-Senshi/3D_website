#!/bin/bash

# Function to process a single file
process_file() {
    local file="$1"
    local temp_file=$(mktemp)
    
    # Create an associative array to store the last line number for each comment
    declare -A last_occurrence
    
    # First pass: Find the last occurrence of each file path comment
    line_number=0
    while IFS= read -r line; do
        ((line_number++))
        
        # Check if line contains a file path comment (matches // followed by a path-like structure)
        if [[ $line =~ ^[[:space:]]*//[[:space:]]*([a-zA-Z0-9_-]+/)*[a-zA-Z0-9_-]+\.(ts|tsx)[[:space:]]*$ ]]; then
            # Remove leading/trailing whitespace
            cleaned_comment=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            last_occurrence["$cleaned_comment"]=$line_number
        fi
    done < "$file"
    
    # Second pass: Only keep the last occurrence of each comment
    line_number=0
    while IFS= read -r line; do
        ((line_number++))
        
        if [[ $line =~ ^[[:space:]]*//.* ]]; then
            # Remove leading/trailing whitespace
            cleaned_comment=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            
            # Only write the line if this is the last occurrence
            if [ "${last_occurrence[$cleaned_comment]}" -eq "$line_number" ]; then
                echo "$line" >> "$temp_file"
            fi
        else
            # Write non-comment lines as is
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace original file with processed content
    mv "$temp_file" "$file"
}

# Main script
echo "Starting file path comment deduplication..."

# Find all .ts and .tsx files recursively
find . -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
    echo "Processing: $file"
    process_file "$file"
done

echo "Finished processing all files."
