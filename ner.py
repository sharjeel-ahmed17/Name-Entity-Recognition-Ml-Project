import spacy
from spacy.training.example import Example

nlp = spacy.load("en_core_web_sm")

TRAIN_DATA = [
    ("Ali lives in Karachi", {"entities": [(0, 3, "PERSON"), (13, 20, "GPE")]}),
    ("Sara works at Google", {"entities": [(0, 4, "PERSON"), (14, 20, "ORG")]}),
    ("Bilal is from Pakistan", {"entities": [(0, 5, "PERSON"), (15, 23, "GPE")]}),
    ("Apple is a tech company", {"entities": [(0, 5, "ORG")]})
]

if "ner" not in nlp.pipe_names:
    ner = nlp.add_pipe("ner")
else:
    ner = nlp.get_pipe("ner")

for _, annotations in TRAIN_DATA:
    for ent in annotations.get("entities"):
        ner.add_label(ent[2])

# =========================
# 6. TRAIN MODEL
# =========================
optimizer = nlp.begin_training()

for i in range(20):
    losses = {}
    for text, annotations in TRAIN_DATA:
        doc = nlp.make_doc(text)
        example = Example.from_dict(doc, annotations)
        nlp.update([example], drop=0.2, losses=losses)
    print(f"Iteration {i} Loss: {losses}")

# =========================
# 7. TEST MODEL
# =========================
test_text = "Ahmed works at Microsoft in Lahore"
doc = nlp(test_text)

print("\nEntities found:")
for ent in doc.ents:
    print(ent.text, ent.label_)

# =========================
# 8. SAVE MODEL
# =========================
nlp.to_disk("ner_model")
print("Model saved successfully!")

# =========================
# 9. LOAD SAVED MODEL
# =========================
# To use later:
# nlp2 = spacy.load("ner_model")
# doc2 = nlp2("Hassan lives in Islamabad")
# print([(ent.text, ent.label_) for ent in doc2.ents])

# =========================
# END OF PROJECT
# =========================
