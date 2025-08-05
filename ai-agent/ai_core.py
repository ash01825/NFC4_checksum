import json
# Updated imports for Google Gemini
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
# Updated config import
from config import GOOGLE_API_KEY

# This is our "Rulebook". It remains exactly the same.
KNOWLEDGE_BASE = [
    "Trade Policy 1: All textile imports must have a GOTS (Global Organic Textile Standard) certification mentioned in the ESG data.",
    "Trade Policy 2: Shipments containing 'conflict minerals' such as tin, tungsten, or gold are prohibited unless they have a valid CMRT (Conflict Minerals Reporting Template) certificate.",
    "ESG Rule 1: Products described as 'eco-friendly' must specify the materials used and have a recognized environmental certification.",
    "ESG Rule 2: Any trade involving animal products must include a 'Cruelty-Free' declaration in its ESG data.",
    "WTO Guideline A: The declared value of goods must be within 20% of the fair market value for that product category to avoid anti-dumping flags."
]

# --- LangChain Setup with Google Gemini ---
try:
    print("🧠 Initializing AI Core with Google Gemini...")
    # Use Google's embedding model
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)

    vector_store = FAISS.from_texts(KNOWLEDGE_BASE, embeddings)
    retriever = vector_store.as_retriever()

    # Use Google's chat model with the CORRECTED, MODERN NAME
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=GOOGLE_API_KEY, temperature=0)

    QA_CHAIN = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever
    )
    print("✅ AI Core ready.")
except Exception as e:
    raise RuntimeError(f"Failed to initialize LangChain with Google Gemini: {e}")


def analyze_trade_data(description: str, esg_data: str) -> dict:
    """
    Analyzes trade data using the LangChain QA chain and returns a structured JSON response.
    The logic here remains exactly the same.
    """
    query = f"""
    Analyze the following trade for compliance based on our internal rules.
    Provide a 'riskScore' from 0 (no risk) to 10 (high risk) and a brief 'explanation'.
    Respond ONLY with a valid JSON object.

    Trade Details:
    - Description: "{description}"
    - ESG Data: "{esg_data}"
    """

    try:
        response = QA_CHAIN.invoke({"query": query})
        result_text = response.get('result', '{}').strip()

        # Cleanly parse the JSON from the AI's response string
        json_start = result_text.find('{')
        json_end = result_text.rfind('}') + 1
        if json_start != -1 and json_end != -1:
            json_str = result_text[json_start:json_end]
            return json.loads(json_str)
        else:
            # Gemini can sometimes add backticks around the JSON, so we'll try to handle that
            if result_text.startswith("```json"):
                result_text = result_text[7:-3].strip()
                return json.loads(result_text)
            return {"error": "Failed to parse valid JSON from AI response", "raw_response": result_text}

    except Exception as e:
        print(f"❌ Error during AI analysis: {e}")
        return {"error": "An exception occurred during analysis"}
