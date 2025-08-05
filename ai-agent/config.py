import os
import json
from dotenv import load_dotenv
from web3 import Web3

# --- Load environment variables ---
load_dotenv()

# --- Blockchain Configuration ---
RPC_URL = os.getenv("BASE_SEPOLIA_RPC_URL")
CONTRACT_ADDRESS = os.getenv("TRADE_AGREEMENT_CONTRACT_ADDRESS")

if not RPC_URL:
    raise ValueError("❌ BASE_SEPOLIA_RPC_URL is not set in .env")

if not CONTRACT_ADDRESS:
    raise ValueError("❌ TRADE_AGREEMENT_CONTRACT_ADDRESS is not set in .env")

# --- AI Configuration ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("❌ OPENAI_API_KEY is not set in .env")

# --- Web3 Setup ---
try:
    W3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not W3.is_connected():
        raise ConnectionError("❌ Web3 failed to connect to RPC URL")

    # Load ABI from artifacts folder (ensure the path is correct)
    ABI_PATH = "../artifacts/contracts/TradeAgreement.sol/TradeAgreement.json"
    with open(ABI_PATH, "r") as f:
        contract_artifact = json.load(f)

    ABI = contract_artifact.get("abi")
    if not ABI:
        raise ValueError("❌ ABI not found in artifact JSON")

    # Instantiate contract
    TRADE_CONTRACT = W3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)
    print("✅ Blockchain connected and contract instance loaded.")

except FileNotFoundError:
    raise FileNotFoundError(f"❌ Artifact file not found at {ABI_PATH}. Run `npx hardhat compile`.")
except Exception as e:
    raise RuntimeError(f"❌ Failed during Web3 or contract setup: {str(e)}")