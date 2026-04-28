"""
Streamlit UI for Name Entity Recognition App
A professional and visually appealing interface for NER analysis
"""

import streamlit as st
import spacy
import requests
from typing import List, Dict, Any
import time

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
    /* Main gradient header */
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 1rem;
        margin-bottom: 1.5rem;
    }

    /* Entity card styling */
    .entity-card {
        background: #f8f9fa;
        border-left: 4px solid #667eea;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }

    /* Entity type badges */
    .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 600;
    }

    .badge-PERSON { background: #e3f2fd; color: #1565c0; }
    .badge-GPE { background: #e8f5e9; color: #2e7d32; }
    .badge-ORG { background: #f3e5f5; color: #7b1fa2; }

    /* Stats card */
    .stats-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        text-align: center;
    }

    /* Highlighted text */
    .highlighted-entity {
        background: linear-gradient(120deg, #a8e6cf 0%, #dcedc1 100%);
        padding: 0.1rem 0.3rem;
        border-radius: 0.25rem;
        font-weight: 500;
    }
</style>
""", unsafe_allow_html=True)

# Title and description
st.markdown("""
<div style="text-align: center; padding: 1rem 0;">
    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏷️ Named Entity Recognition</h1>
    <p style="color: #666; font-size: 1.1rem;">Extract and analyze named entities from your text using AI</p>
</div>
""", unsafe_allow_html=True)

# Load the NER model
@st.cache_resource
def load_model():
    """Load the trained NER model"""
    try:
        return spacy.load("ner_model")
    except OSError:
        st.warning("Custom model not found. Using default model.")
        return spacy.load("en_core_web_sm")

nlp = load_model()

# Sidebar with options
with st.sidebar:
    st.markdown("### ⚙️ Settings")

    st.markdown("---")
    st.markdown("### ℹ️ About")
    st.info("""
    This app uses a trained spaCy NER model to recognize:
    - **PERSON**: People's names
    - **GPE**: Geographic places (cities, countries)
    - **ORG**: Organizations
    """)

    st.markdown("---")
    st.markdown("### 📊 Available Labels")
    if "ner" in nlp.pipe_names:
        ner = nlp.get_pipe("ner")
        labels = list(ner.labels)
    else:
        labels = ["PERSON", "GPE", "ORG"]

    for label in labels:
        st.markdown(f"- **{label}**")

# Main content tabs
tab1, tab2, tab3 = st.tabs(["🔍 Single Text", "📚 Batch Processing", "ℹ️ Model Info"])

with tab1:
    # Input section
    col1, col2 = st.columns([3, 1])

    with col1:
        text_input = st.text_area(
            "Enter your text to analyze:",
            height=150,
            placeholder="e.g., Ali lives in Karachi and works at Apple",
            label_visibility="collapsed"
        )

    with col2:
        analyze_btn = st.button("🚀 Analyze", type="primary", use_container_width=True)

    if analyze_btn and text_input:
        with st.spinner("Analyzing text..."):
            # Process text
            doc = nlp(text_input)
            entities = list(doc.ents)

            # Display results
            st.markdown("---")
            st.markdown("### 📋 Analysis Results")

            # Stats row
            cols = st.columns(4)
            with cols[0]:
                st.metric("Total Entities", len(entities))
            with cols[1]:
                st.metric("Characters", len(text_input))
            with cols[2]:
                st.metric("Words", len(text_input.split()))
            with cols[3]:
                entity_types = len(set(e.label_ for e in entities))
                st.metric("Unique Types", entity_types)

            # Highlighted text display
            st.markdown("#### ✨ Highlighted Text")
            highlighted_html = ""
            last_idx = 0

            for ent in sorted(entities, key=lambda x: x.start_char):
                highlighted_html += text_input[last_idx:ent.start_char]
                highlighted_html += f'<mark style="background: #a8e6cf; padding: 2px 4px; border-radius: 4px;">{ent.text}</mark>'
                last_idx = ent.end_char

            highlighted_html += text_input[last_idx:]
            st.markdown(highlighted_html, unsafe_allow_html=True)

            # Entity details table
            if entities:
                st.markdown("#### 📦 Entity Details")

                for i, ent in enumerate(entities, 1):
                    # Create expandable card for each entity
                    with st.expander(f"**{i}. {ent.text}**", expanded=True):
                        c1, c2, c3, c4 = st.columns(4)
                        with c1:
                            st.markdown("**Type:**")
                            st.markdown(f"<span class='badge badge-{ent.label_}'>{ent.label_}</span>", unsafe_allow_html=True)
                        with c2:
                            st.metric("Start", ent.start_char)
                        with c3:
                            st.metric("End", ent.end_char)
                        with c4:
                            st.metric("Length", ent.end_char - ent.start_char)
            else:
                st.info("No entities found in the provided text.")

    elif analyze_btn and not text_input:
        st.warning("Please enter some text to analyze.")

with tab2:
    # Batch processing
    st.markdown("### Process Multiple Texts")
    st.markdown("Enter multiple texts (one per line) for batch entity recognition:")

    batch_input = st.text_area(
        "Batch input:",
        height=200,
        placeholder="Ali lives in Karachi\nSara works at Google\nBilal is from Pakistan\nApple is a tech company",
        label_visibility="collapsed"
    )

    batch_btn = st.button("📚 Process All", type="primary")

    if batch_btn and batch_input:
        texts = [line.strip() for line in batch_input.split("\n") if line.strip()]

        with st.spinner("Processing batch..."):
            results = []
            for text in texts:
                doc = nlp(text)
                entities = [(ent.text, ent.label_, ent.start_char, ent.end_char) for ent in doc.ents]
                results.append({
                    "text": text,
                    "entities": entities,
                    "count": len(entities)
                })

            # Display results
            st.markdown("---")
            st.markdown(f"### 📊 Batch Results ({len(results)} texts)")

            total_entities = sum(r["count"] for r in results)
            c1, c2 = st.columns(2)
            c1.metric("Total Texts", len(texts))
            c2.metric("Total Entities Found", total_entities)

            # Results table
            for i, result in enumerate(results, 1):
                with st.expander(f"**Text {i}:** {result['text'][:50]}...", expanded=False):
                    if result["entities"]:
                        for ent_text, ent_label, start, end in result["entities"]:
                            col_a, col_b, col_c = st.columns([2, 1, 1])
                            with col_a:
                                st.write(ent_text)
                            with col_b:
                                st.markdown(f"<span class='badge badge-{ent_label}'>{ent_label}</span>", unsafe_allow_html=True)
                            with col_c:
                                st.caption(f"Pos: {start}-{end}")
                    else:
                        st.caption("No entities found")

    elif batch_btn and not batch_input:
        st.warning("Please enter some texts to process.")

with tab3:
    # Model information
    st.markdown("### 🤖 Model Information")

    c1, c2, c3 = st.columns(3)
    with c1:
        st.metric("Model Type", "spaCy NER")
    with c2:
        st.metric("Labels", len(labels))
    with c3:
        st.metric("Pipeline", "ner")

    st.markdown("---")
    st.markdown("### 🏷️ Entity Labels")

    for label in labels:
        col1, col2 = st.columns([1, 3])
        with col1:
            st.markdown(f"<span class='badge badge-{label}'>{label}</span>", unsafe_allow_html=True)
        with col2:
            if label == "PERSON":
                st.caption("People's names (real and fictional)")
            elif label == "GPE":
                st.caption("Countries, cities, states")
            elif label == "ORG":
                st.caption("Companies, agencies, institutions")
            else:
                st.caption("Custom entity type")

    st.markdown("---")
    st.success("✅ Model loaded successfully!")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #888; padding: 1rem;">
    <p>🏷️ NER Analyzer • Built with Streamlit & spaCy</p>
</div>
""", unsafe_allow_html=True)