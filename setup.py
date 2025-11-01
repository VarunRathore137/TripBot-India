from setuptools import setup, find_packages

setup(
    name="tripbot",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "torch",
        "transformers",
        "pydantic",
        "python-dotenv",
        "scikit-learn",
        "pandas",
        "tqdm",
        "wandb"
    ],
)