FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy dependency files first (IMPORTANT for caching)
COPY pyproject.toml uv.lock README.md ./

# Install dependencies (creates .venv)
RUN uv sync --frozen --no-cache

# Copy source code and model
COPY main.py ./
COPY ner.py ./
COPY ner_model ./ner_model

# Set virtual environment path
ENV VIRTUAL_ENV=/app/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Create non-root user
RUN useradd -m app
RUN chown -R app:app /app
USER app

# Environment variables
ENV PORT=8000

# Docker documentation only (keep static)
EXPOSE ${PORT}

# Run app
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]