import os
import json
from dotenv import load_dotenv
from web3 import Web3

# Load all environment variables from the .env file
load_dotenv()

# --- Blockchain Configuration ---
RPC_URL = os.getenv("BASE_SEPOLIA_RPC_URL")
CONTRACT_ADDRESS = os.getenv("TRADE_AGREEMENT_CONTRACT_ADDRESS")
if not RPC_URL:
    raise ValueError("RPC URL not set!")

if not CONTRACT_ADDRESS or CONTRACT_ADDRESS == "YOUR_DEPLOYED_TRADEAGREEMENT_ADDRESS":
    print("⚠️ WARNING: No valid TradeAgreement contract address set. Using dummy address for testing.")
    CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"  # dummy zero address

# --- AI Configuration ---
# Switched from OpenAI to Google
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not set!")

# --- Web3 Setup ---
try:
    W3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not W3.is_connected():
        raise ConnectionError("Failed to connect to blockchain via RPC_URL")

    # Load the contract ABI from the artifact file
    # Make sure the path is correct relative to where you run the script
    with open("../artifacts/contracts/TradeAgreement.sol/TradeAgreement.json") as f:
        info_json = json.load(f)
    ABI = info_json["abi"]

    # Create a contract instance
    try:
        if CONTRACT_ADDRESS == "0x0000000000000000000000000000000000000000":
            TRADE_CONTRACT = None
        else:
            TRADE_CONTRACT = W3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)
    except Exception as e:
        print(f"⚠️ Contract instantiation skipped due to invalid address: {e}")
        TRADE_CONTRACT = None
    print("✅ Configuration loaded and connected to blockchain.")

except FileNotFoundError:
    print("❌ ERROR: Contract artifact not found. Make sure you have compiled your contracts.")
    raise
except Exception as e:
    print(f"❌ ERROR in configuration: {e}")
    raise
