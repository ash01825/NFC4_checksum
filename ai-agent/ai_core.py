import json
from langchain_openai import OpenAIEmbeddings, OpenAI
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from config import OPENAI_API_KEY

# --- Rulebook (Knowledge Base) ---
KNOWLEDGE_BASE = [
    "Trade Policy 1: All textile imports must have a GOTS (Global Organic Textile Standard) certification mentioned in the ESG data.",
    "Trade Policy 2: Shipments containing 'conflict minerals' such as tin, tungsten, or gold are prohibited unless they have a valid CMRT (Conflict Minerals Reporting Template) certificate.",
    "ESG Rule 1: Products described as 'eco-friendly' must specify the materials used and have a recognized environmental certification.",
    "ESG Rule 2: Any trade involving animal products must include a 'Cruelty-Free' declaration in its ESG data.",
    "WTO Guideline A: The declared value of goods must be within 20% of the fair market value for that product category to avoid anti-dumping flags."
]

# --- LangChain Setup ---
try:
    print("🧠 Initializing AI Core...")

    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    vector_store = FAISS.from_texts(KNOWLEDGE_BASE, embeddings)
    retriever = vector_store.as_retriever()

    QA_CHAIN = RetrievalQA.from_chain_type(
        llm=OpenAI(openai_api_key=OPENAI_API_KEY, temperature=0),
        chain_type="stuff",
        retriever=retriever
    )

    print("✅ AI Core ready.")

except Exception as e:
    raise RuntimeError(f"❌ Failed to initialize LangChain: {e}")


# --- Compliance Analysis Function ---
def analyze_trade_data(description: str, esg_data: str) -> dict:
    """
    Analyze trade data for compliance based on internal rules.
    Returns a dict with 'riskScore' and 'explanation', or error.
    """
    query = f"""
    Analyze the following trade for compliance based on internal rules.
    Return a JSON object with a 'riskScore' (0-10) and a brief 'explanation'.

    Trade Details:
    - Description: "{description}"
    - ESG Data: "{esg_data}"
    """

    try:
        response = QA_CHAIN.invoke({"query": query})
        result_text = response.get('result', '{}').strip()

        # Attempt to parse the JSON from result text
        json_start = result_text.find('{')
        json_end = result_text.rfind('}') + 1

        if json_start != -1 and json_end > json_start:
            json_str = result_text[json_start:json_end]
            return json.loads(json_str)

        return {
            "error": "❌ Failed to parse valid JSON from AI response",
            "raw_response": result_text
        }

    except Exception as e:
        print(f"❌ Exception during AI analysis: {e}")
        return {"error": "❌ Exception occurred during analysis"}