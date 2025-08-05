from flask import Flask, request, jsonify
from ai_core import analyze_trade_data

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyze a trade for compliance and ESG criteria.
    Expects a JSON body with 'description' and 'esgData'.
    """
    data = request.get_json()
    if not data or 'description' not in data or 'esgData' not in data:
        return jsonify({"error": "Missing 'description' or 'esgData' in request body"}), 400

    description = data['description']
    esg_data = data['esgData']

    print(f"[INFO] Analyzing trade: {description}")

    try:
        analysis_result = analyze_trade_data(description, esg_data)
        if "error" in analysis_result:
            raise ValueError(analysis_result["error"])
    except Exception as e:
        print(f"[ERROR] Analysis failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

    print(f"[SUCCESS] AI Analysis Result: {analysis_result}")
    return jsonify(analysis_result), 200

if __name__ == '__main__':
    # Host on 0.0.0.0 to allow access from external apps (e.g., your smart contracts)
    app.run(host='0.0.0.0', port=5001, debug=True)