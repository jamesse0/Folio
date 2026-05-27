# ML pipeline orchestrator — called as a background task after every photo upload
# Phase 1: stub (does nothing, photo.is_ml_processed remains False)
# Phase 2: calls faces.py, places.py, vibes.py in sequence, then sets is_ml_processed=True
