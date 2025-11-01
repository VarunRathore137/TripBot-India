import json
import pandas as pd
from sklearn.model_selection import train_test_split
from pathlib import Path

def prepare_training_data(input_path, output_dir):
    """Prepare and split the training data."""
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Convert to DataFrame for easier manipulation
    df = pd.DataFrame(data)
    
    # Split into train/val/test
    train_data, test_data = train_test_split(df, test_size=0.2, random_state=42)
    train_data, val_data = train_test_split(train_data, test_size=0.1, random_state=42)
    
    # Save splits
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)
    
    train_data.to_json(output_dir / 'train.json', orient='records', force_ascii=False)
    val_data.to_json(output_dir / 'val.json', orient='records', force_ascii=False)
    test_data.to_json(output_dir / 'test.json', orient='records', force_ascii=False)

if __name__ == '__main__':
    prepare_training_data(
        input_path='data/raw/itineraries.json',
        output_dir='data/processed'
    )