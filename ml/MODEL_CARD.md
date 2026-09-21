# Candidate Match API model/version documentation

Version 1.0.0 uses exact normalized skill overlap (70%) and cosine semantic similarity (30%).

`POST /train` can calibrate score weights from at least eight independently human-reviewed, labeled resume/JD pairs. It derives matching features from each pair and saves a local `trained_match_model.json`; keep the training data representative, consented, and reviewed for bias. Training labels must be match-quality labels, not automatic hiring outcomes.

Multilingual routing identifies English, Spanish, French, German, and Portuguese using local language markers and normalizes common translated technical skills into shared canonical names. The system returns `und` when it cannot reliably identify a language; in that case treat results as lower confidence.

The evidence engine scores textual support in the supplied resume: a skill mention, action context, and measurable outcome. It does **not** verify that a claim is true. Every extracted claim is explicitly marked as self-reported and needs an authorized external check (such as a work sample, reference, or credential) before it is treated as verified.

The preferred embedding model is `all-MiniLM-L6-v2`, activated with `ENABLE_SENTENCE_TRANSFORMER=true` when its dependency and weights are installed. The default offline fallback is `hashing-tfidf-384-v1`; it is deterministic and requires no network download, but is less semantically capable than the transformer.

Scores are decision support, not hiring decisions. Evidence is quoted from supplied resume text, and a missing skill means it was not detected, not that the person lacks it. Validate results with a qualified reviewer and monitor performance on representative, consented evaluation data.
