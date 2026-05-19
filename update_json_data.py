import json
import pandas as pd
import numpy as np

def update_data():
    json_path = 'src/data.json'
    excel_path = 'updated_data.xlsx'
    
    print(f"Reading {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print(f"Reading {excel_path}...")
    df = pd.read_excel(excel_path)
    
    # Fill any missing values with 0
    df = df.fillna(0)
    
    # Index by Part Number for quick lookup
    df.set_index('Part Number', inplace=True)
    
    updated_count = 0
    not_found = []
    
    for item in data:
        ps_no = item['ps_no']
        if ps_no in df.index:
            row = df.loc[ps_no]
            
            # Update percentage (round to 2 decimal places)
            item['percentage'] = round(float(row['% Electors Mapped']), 2)
            
            # Add/Update new detailed stats
            item['total_electors'] = int(row['Total electors'])
            item['mapped_electors'] = int(row['Total Mapped Electors'])
            item['unmapped_electors'] = int(row['Total Unmapped Electors'])
            item['anomalies'] = int(row['Electors with Anomalies'])
            
            updated_count += 1
        else:
            not_found.append(ps_no)
            
    print(f"Successfully matched and updated {updated_count} records.")
    if not_found:
        print(f"Warning: The following PS Numbers were not found in the Excel sheet: {not_found}")
        
    # Write back to src/data.json
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Successfully wrote updated database back to {json_path}!")

if __name__ == '__main__':
    update_data()
