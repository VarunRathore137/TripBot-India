import requests

# Set your OpenAI API key and model name
API_KEY = "YOUR_API_KEY_HERE"
MODEL_NAME = "text-davinci-002"

def generate_itinerary(prompt):
    # Set the request headers and parameters
    headers = {"Authorization": f"Bearer {API_KEY}"}
    params = {
        "prompt": prompt,
        "max_length": 2000,
        "temperature": 0.5,  # Adjust this to control creativity
    }

    # Make the API request
    response = requests.post(
        f"https://api.openai.com/v1/engines/{MODEL_NAME}/completions",
        headers=headers,
        params=params,
    )

    # Check if the response was successful
    if response.status_code == 200:
        return response.json()["choices"][0]["text"]
    else:
        print(f"Error: {response.status_code}")
        return None

# Example usage
prompt = "I'm planning a 5-day trip to India. Please suggest an itinerary..."
itinerary = generate_itinerary(prompt)
print(itinerary)  # Output: A suggested travel itinerary in text format
