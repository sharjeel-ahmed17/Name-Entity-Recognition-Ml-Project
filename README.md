# Name Entity Recognition ML Project

A FastAPI-based REST API for Named Entity Recognition (NER) using spaCy. This project trains a custom NER model to recognize entities like **PERSON**, **GPE** (geopolitical entities), and **ORG** (organizations) in text.

## Features

- Custom NER model trained with spaCy
- FastAPI REST API with multiple endpoints
- Single and batch entity recognition
- Docker support for easy deployment
- Built with `uv` for fast dependency management

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Health status |
| `/recognize` | POST | Recognize entities in a single text |
| `/recognize/batch` | POST | Recognize entities in multiple texts |
| `/labels` | GET | Get available entity labels |

### Example Request

```bash
curl -X POST http://localhost:8000/recognize \
  -H "Content-Type: application/json" \
  -d '{"text": "Ali lives in Karachi and works at Google"}'
```

### Example Response

```json
{
  "text": "Ali lives in Karachi and works at Google",
  "entities": [
    {"text": "Ali", "label": "PERSON", "start": 0, "end": 3},
    {"text": "Karachi", "label": "GPE", "start": 13, 20},
    {"text": "Google", "label": "ORG", "start": 31, "end": 37}
  ],
  "entity_count": 3
}
```

## Quick Start

### Local Development

```bash
# Install uv (if not already installed)
pip install uv

# Create virtual environment
uv venv --python 3.12 .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
uv sync

# Download spaCy model
uv run python -m spacy download en_core_web_sm

# Train the model (optional - model already included)
uv run python ner.py

# Run the API server
uv run python main.py
```

Visit http://localhost:8000/docs for interactive API documentation.

### Docker

```bash
# Build the image
docker build -t ner-api .

# Run the container
docker run -d -p 8000:8000 --name ner-api-container ner-api

# Access API at http://localhost:8000
```

### Docker Hub

Pull the pre-built image:

```bash
docker pull sharjeelahmed017/ner-api:latest
docker run -d -p 8000:8000 --name ner-api-container sharjeelahmed017/ner-api:latest
```

## Project Structure

```
.
├── main.py              # FastAPI application
├── ner.py               # NER model training script
├── ner_model/           # Trained spaCy model
├── images/              # Documentation images
├── index.md             # Setup guide
├── pyproject.toml       # Project dependencies
├── Dockerfile           # Docker configuration
└── .dockerignore        # Docker ignore rules
```

## Why uv?

This project uses [`uv`](https://github.com/astral-sh/uv) for dependency management because it's:

- **⚡ Extremely Fast** - 10-100x faster than pip
- **📦 Built-in Virtualenvs** - Creates environments instantly
- **🔄 Pip Compatible** - Drop-in replacement for pip
- **💾 Global Cache** - Shares downloads across projects
- **🛠️ Tool Management** - Run Python tools in isolated environments

## License

MIT

## Links

- **GitHub Repository**: [https://github.com/sharjeel-ahmed17/Name-Entity-Recognition-Ml-Project](https://github.com/sharjeel-ahmed17/Name-Entity-Recognition-Ml-Project)
- **Hugging Face Demo**: [https://sharjeel17-name-identity-recognizaion.hf.space/](https://sharjeel17-name-identity-recognizaion.hf.space/)
- **Streamlit App**: [https://name-identity-recognition.streamlit.app/](https://name-identity-recognition.streamlit.app/)

## Author

Sharjeel Ahmed

[Docker Hub](https://hub.docker.com/r/sharjeelahmed017/ner-api)

```bash
docker pull sharjeelahmed017/ner-api
```
