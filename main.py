from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import spacy

app = FastAPI(
    title="Name Entity Recognition API",
    description="API for recognizing named entities in text using a custom spaCy NER model",
    version="1.0.0"
)

# Load the trained NER model
try:
    nlp = spacy.load("ner_model")
except OSError:
    nlp = spacy.load("en_core_web_sm")
    print("Warning: Custom model not found. Using default en_core_web_sm")


class EntityResponse(BaseModel):
    text: str
    label: str
    start: int
    end: int
    confidence: Optional[float] = None


class NERRequest(BaseModel):
    text: str = Field(..., description="Input text to analyze for named entities", min_length=1)
    include_scores: bool = Field(default=False, description="Whether to include confidence scores")


class NERResponse(BaseModel):
    text: str
    entities: List[EntityResponse]
    entity_count: int


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "NER API is running"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "model_loaded": True}


@app.post("/recognize", response_model=NERResponse, tags=["NER"])
async def recognize_entities(request: NERRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")

    try:
        doc = nlp(request.text)
        entities = []

        for ent in doc.ents:
            entity = EntityResponse(
                text=ent.text,
                label=ent.label_,
                start=ent.start_char,
                end=ent.end_char,
                confidence=None
            )
            entities.append(entity)

        return NERResponse(
            text=request.text,
            entities=entities,
            entity_count=len(entities)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")


@app.post("/recognize/batch", response_model=List[NERResponse], tags=["NER"])
async def recognize_entities_batch(texts: List[str]):
    if not texts:
        raise HTTPException(status_code=400, detail="Text list cannot be empty")

    try:
        results = []
        for text in texts:
            if not text.strip():
                continue
            doc = nlp(text)
            entities = [
                EntityResponse(
                    text=ent.text,
                    label=ent.label_,
                    start=ent.start_char,
                    end=ent.end_char,
                    confidence=None
                )
                for ent in doc.ents
            ]
            results.append(NERResponse(
                text=text,
                entities=entities,
                entity_count=len(entities)
            ))

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing batch: {str(e)}")


@app.get("/labels", tags=["NER"])
async def get_available_labels():
    if "ner" in nlp.pipe_names:
        ner = nlp.get_pipe("ner")
        labels = list(ner.labels)
    else:
        labels = []

    return {"available_labels": labels}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
