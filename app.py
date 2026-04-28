"""
Streamlit UI for Name Entity Recognition App
Consumes FastAPI backend endpoints
"""

import streamlit as st
import requests
from typing import List, Optional
import json

# Page configuration
st.set_page_config(
    page_title="NER Analyzer",
    page_icon="🏷️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    /* Main container styling */
    .main .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }

    /* Header styling */
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 1rem;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .main-header h1 {
        color: white;
        margin: 0;
        font-size: 2.5rem;
    }

    .main-header p {
        color: rgba(255, 255, 255, 0.9);
        margin-top: 0.5rem;
        font-size: 1.1rem;
    }

    /* Entity badge styling */
    .entity-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.85rem;
        font-weight: 600;
        margin: 0.25rem;
    }

    .badge-PERSON { background: #e3f2fd; color: #1565c0; }
    .badge-GPE { background: #e8f5e9; color: #2e7d32; }
    .badge-ORG { background: #f3e5f5; color: #7b1fa2; }
    .badge-default { background: #fff3e0; color: #ef6c00; }

    /* Stats cards */
    .stat-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.25rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        text-align: center;
        border: 1px solid #e0e0e0;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #667eea;
    }

    .stat-label {
        color: #666;
        font-size: 0.9rem;
        margin-top: 0.25rem;
    }

    /* Entity card */
    .entity-card {
        background: #f8f9fa;
        border-left: 4px solid #667eea;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }

    /* Highlighted text container */
    .highlight-container {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        border: 1px solid #e0e0e0;
        line-height: 2;
        font-size: 1.1rem;
    }

    /* Entity highlight spans */
    .entity-highlight {
        background: linear-gradient(120deg, #a8e6cf 0%, #dcedc1 100%);
        padding: 0.15rem 0.4rem;
        border-radius: 0.3rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .entity-highlight:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
</style>
""", unsafe_allow_html=True)

# API Base URL configuration
DEFAULT_API_URL = "http://localhost:8000"

# Session state initialization
if "api_url" not in st.session_state:
    st.session_state.api_url = DEFAULT_API_URL
if "last_results" not in st.session_state:
    st.session_state.last_results = None

# Header
st.markdown("""
<div class="main-header">
    <h1>🏷️ Named Entity Recognition</h1>
    <p>Extract and analyze named entities from text using AI-powered NER</p>
</div>
""", unsafe_allow_html=True)

# Sidebar configuration
with st.sidebar:
    st.markdown("### ⚙️ API Configuration")

    api_url = st.text_input(
        "FastAPI Backend URL",
        value=st.session_state.api_url,
        placeholder="http://localhost:8000",
        help="URL of the FastAPI NER backend"
    )

    if api_url != st.session_state.api_url:
        st.session_state.api_url = api_url
        st.rerun()

    st.markdown("---")

    # Health check
    st.markdown("### 🔌 Connection Status")
    try:
        health_response = requests.get(f"{api_url}/health", timeout=5)
        if health_response.status_code == 200:
            st.success("✅ Connected")
            st.json(health_response.json())
        else:
            st.error("❌ Connection failed")
    except requests.exceptions.ConnectionError:
        st.error("❌ Cannot connect to API")
        st.info(f"Make sure the FastAPI server is running at `{api_url}`")
        st.code("python main.py")
    except Exception as e:
        st.error(f"❌ Error: {str(e)}")

    st.markdown("---")

    # Fetch available labels
    st.markdown("### 🏷️ Entity Types")
    try:
        labels_response = requests.get(f"{api_url}/labels", timeout=5)
        if labels_response.status_code == 200:
            labels = labels_response.json().get("available_labels", [])
            for label in labels:
                badge_class = f"badge-{label}" if label in ["PERSON", "GPE", "ORG"] else "badge-default"
                st.markdown(f'<span class="entity-badge {badge_class}">{label}</span>', unsafe_allow_html=True)
        else:
            st.caption("PERSON, GPE, ORG")
    except:
        st.caption("PERSON, GPE, ORG")

    st.markdown("---")
    st.markdown("### ℹ️ About")
    st.info("""
    This app connects to a FastAPI backend
    that uses spaCy NER to recognize:
    - **PERSON**: People's names
    - **GPE**: Geographic places
    - **ORG**: Organizations
    """)

# Main tabs
tab1, tab2, tab3 = st.tabs(["🔍 Single Text", "📚 Batch Processing", "📖 API Docs"])

with tab1:
    st.markdown("### Analyze Single Text")

    # Input section
    col1, col2 = st.columns([4, 1])

    with col1:
        text_input = st.text_area(
            "Enter text to analyze:",
            height=120,
            placeholder="e.g., Ali lives in Karachi and works at Apple. Sara works at Microsoft in Lahore.",
            label_visibility="collapsed"
        )

    with col2:
        st.markdown("<div style='padding-top: 2.5rem;'>", unsafe_allow_html=True)
        analyze_btn = st.button("🚀 Analyze", type="primary", use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

    if analyze_btn:
        if not text_input.strip():
            st.warning("⚠️ Please enter some text to analyze.")
        else:
            with st.spinner("🔍 Analyzing text..."):
                try:
                    # Call FastAPI endpoint
                    response = requests.post(
                        f"{api_url}/recognize",
                        json={"text": text_input, "include_scores": False},
                        timeout=30
                    )

                    if response.status_code == 200:
                        result = response.json()
                        st.session_state.last_results = result

                        entities = result.get("entities", [])

                        # Stats display
                        st.markdown("---")
                        st.markdown("### 📊 Results")

                        cols = st.columns(4)
                        with cols[0]:
                            st.markdown(f"""
                            <div class="stat-card">
                                <div class="stat-value">{len(entities)}</div>
                                <div class="stat-label">Entities Found</div>
                            </div>
                            """, unsafe_allow_html=True)
                        with cols[1]:
                            st.markdown(f"""
                            <div class="stat-card">
                                <div class="stat-value">{len(text_input)}</div>
                                <div class="stat-label">Characters</div>
                            </div>
                            """, unsafe_allow_html=True)
                        with cols[2]:
                            st.markdown(f"""
                            <div class="stat-card">
                                <div class="stat-value">{len(text_input.split())}</div>
                                <div class="stat-label">Words</div>
                            </div>
                            """, unsafe_allow_html=True)
                        with cols[3]:
                            unique_types = len(set(e["label"] for e in entities))
                            st.markdown(f"""
                            <div class="stat-card">
                                <div class="stat-value">{unique_types}</div>
                                <div class="stat-label">Entity Types</div>
                            </div>
                            """, unsafe_allow_html=True)

                        # Highlighted text
                        st.markdown("#### ✨ Highlighted Text")

                        if entities:
                            # Sort entities by start position
                            sorted_entities = sorted(entities, key=lambda x: x["start"])

                            # Build highlighted HTML
                            highlighted = ""
                            last_end = 0

                            for ent in sorted_entities:
                                highlighted += text_input[last_end:ent["start"]]
                                badge_class = f"badge-{ent['label']}" if ent["label"] in ["PERSON", "GPE", "ORG"] else "badge-default"
                                highlighted += f'<span class="entity-highlight" title="{ent["label"]}">{ent["text"]}</span>'
                                last_end = ent["end"]

                            highlighted += text_input[last_end:]

                            st.markdown(f"""
                            <div class="highlight-container">{highlighted}</div>
                            """, unsafe_allow_html=True)

                            # Entity details table
                            st.markdown("#### 📦 Entity Details")

                            for i, ent in enumerate(entities, 1):
                                with st.expander(f"**#{i}.** `{ent['text']}`", expanded=True):
                                    c1, c2, c3, c4 = st.columns(4)
                                    with c1:
                                        badge_class = f"badge-{ent['label']}" if ent["label"] in ["PERSON", "GPE", "ORG"] else "badge-default"
                                        st.markdown(f"**Type:**<br><span class='entity-badge {badge_class}'>{ent['label']}</span>", unsafe_allow_html=True)
                                    with c2:
                                        st.metric("Start", ent["start"])
                                    with c3:
                                        st.metric("End", ent["end"])
                                    with c4:
                                        st.metric("Length", ent["end"] - ent["start"])
                        else:
                            st.info("📭 No entities found in the provided text.")
                            st.markdown(f"""
                            <div class="highlight-container">{text_input}</div>
                            """, unsafe_allow_html=True)

                        # Raw JSON response
                        with st.expander("📄 View Raw JSON Response"):
                            st.json(result)

                    else:
                        st.error(f"❌ API Error: {response.status_code}")
                        st.error(response.json().get("detail", "Unknown error"))

                except requests.exceptions.ConnectionError:
                    st.error("❌ Cannot connect to API. Make sure the FastAPI server is running.")
                    st.code("python main.py")
                except requests.exceptions.Timeout:
                    st.error("❌ Request timed out. Please try again.")
                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")

with tab2:
    st.markdown("### Batch Processing")
    st.markdown("Enter multiple texts (one per line) to process in batch:")

    batch_input = st.text_area(
        "Batch input:",
        height=200,
        placeholder="Ali lives in Karachi\nSara works at Google\nBilal is from Pakistan\nApple is a tech company",
        label_visibility="collapsed"
    )

    batch_btn = st.button("📚 Process All", type="primary")

    if batch_btn:
        if not batch_input.strip():
            st.warning("⚠️ Please enter some texts to process.")
        else:
            texts = [line.strip() for line in batch_input.split("\n") if line.strip()]

            with st.spinner(f"🔍 Processing {len(texts)} texts..."):
                try:
                    # Call batch endpoint
                    response = requests.post(
                        f"{api_url}/recognize/batch",
                        json=texts,
                        timeout=60
                    )

                    if response.status_code == 200:
                        results = response.json()

                        # Summary stats
                        total_entities = sum(r.get("entity_count", 0) for r in results)
                        c1, c2, c3 = st.columns(3)
                        c1.metric("Total Texts", len(texts))
                        c2.metric("Total Entities", total_entities)
                        c3.metric("Avg per Text", round(total_entities / len(texts), 2) if texts else 0)

                        st.markdown("---")
                        st.markdown("### 📋 Results")

                        for i, result in enumerate(results, 1):
                            entities = result.get("entities", [])

                            with st.expander(f"**Text {i}:** {result.get('text', '')[:60]}...", expanded=False):
                                st.write(f"**Full text:** {result.get('text', '')}")
                                st.write(f"**Entity count:** {result.get('entity_count', 0)}")

                                if entities:
                                    st.markdown("**Entities:**")
                                    for ent in entities:
                                        cc1, cc2, cc3 = st.columns([3, 1, 2])
                                        with cc1:
                                            st.write(f"📍 {ent['text']}")
                                        with cc2:
                                            badge_class = f"badge-{ent['label']}" if ent["label"] in ["PERSON", "GPE", "ORG"] else "badge-default"
                                            st.markdown(f'<span class="entity-badge {badge_class}">{ent["label"]}</span>', unsafe_allow_html=True)
                                        with cc3:
                                            st.caption(f"Position: {ent['start']} - {ent['end']}")
                                else:
                                    st.caption("No entities found")
                    else:
                        st.error(f"❌ API Error: {response.status_code}")
                        st.error(response.json().get("detail", "Unknown error"))

                except requests.exceptions.ConnectionError:
                    st.error("❌ Cannot connect to API")
                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")

with tab3:
    st.markdown("### 📖 API Documentation")

    st.markdown("""
    This Streamlit app connects to a FastAPI backend with the following endpoints:
    """)

    st.markdown("#### 🔌 Endpoints")

    st.markdown("""
    | Method | Endpoint | Description |
    |--------|----------|-------------|
    | GET | `/` | Health check - API status |
    | GET | `/health` | Health check with model status |
    | POST | `/recognize` | Analyze single text for entities |
    | POST | `/recognize/batch` | Analyze multiple texts |
    | GET | `/labels` | Get available entity labels |
    """)

    st.markdown("#### 📝 Request/Response Examples")

    st.markdown("**POST /recognize**")
    st.code("""
    # Request
    {
        "text": "Ali lives in Karachi",
        "include_scores": false
    }

    # Response
    {
        "text": "Ali lives in Karachi",
        "entities": [
            {"text": "Ali", "label": "PERSON", "start": 0, "end": 3},
            {"text": "Karachi", "label": "GPE", "start": 13, "end": 20}
        ],
        "entity_count": 2
    }
    """, language="json")

    st.markdown("**POST /recognize/batch**")
    st.code("""
    # Request
    ["Ali lives in Karachi", "Sara works at Google"]

    # Response
    [
        {
            "text": "Ali lives in Karachi",
            "entities": [...],
            "entity_count": 2
        },
        {
            "text": "Sara works at Google",
            "entities": [...],
            "entity_count": 2
        }
    ]
    """, language="json")

    st.markdown("---")
    st.info(f"🔗 API Base URL: `{api_url}`")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #888; padding: 1rem;">
    <p>🏷️ NER Analyzer • Frontend: Streamlit | Backend: FastAPI + spaCy</p>
</div>
""", unsafe_allow_html=True)