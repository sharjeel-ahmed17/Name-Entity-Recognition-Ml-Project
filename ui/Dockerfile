FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy dependency files first (IMPORTANT for caching)
COPY pyproject.toml uv.lock README.md ./

# Install dependencies (creates .venv)
RUN uv sync --frozen --no-cache

# Copy source code
COPY app.py ./

# Set virtual environment path
ENV VIRTUAL_ENV=/app/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Create non-root user
RUN useradd -m streamlit
RUN chown -R streamlit:streamlit /app
USER streamlit

# Environment variables
ENV STREAMLIT_SERVER_PORT=8501
ENV STREAMLIT_SERVER_ADDRESS=0.0.0.0
ENV STREAMLIT_SERVER_HEADLESS=true

EXPOSE 8501

# Run Streamlit
CMD ["streamlit", "run", "app.py"]
