import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from flask import Flask, jsonify, request

from pipeline import run_search_pipeline

app = Flask(__name__)


@app.post("/api/research")
def research():
    payload = request.get_json(silent=True) or {}
    topic = str(payload.get("topic", "")).strip()

    if not topic:
        return jsonify({"error": "Enter a topic to research."}), 400

    try:
        return jsonify(run_search_pipeline(topic))
    except Exception as error:
        app.logger.exception("Research pipeline failed")
        return jsonify({"error": str(error)}), 500


handler = app