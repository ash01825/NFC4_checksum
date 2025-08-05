import time
import requests
from config import TRADE_CONTRACT


def handle_event(event):
    """
    Handles a new TradeCreated event by calling our Flask AI API.
    """
    trade_id = event['args']['tradeId']
    print(f"\n🔔 New on-chain Trade Detected! Trade ID: {trade_id}")

    try:
        # Fetch full trade details from the smart contract
        if not TRADE_CONTRACT:
            print("⚠️ Skipping blockchain call, contract not available.")
            return
        trade_details = TRADE_CONTRACT.functions.trades(trade_id).call()

        trade_data = {
            "description": trade_details[4],  # description
            "esgData": trade_details[5]  # esgData
        }

        print(f"   ↳ Forwarding to AI API: {trade_data['description']}")

        # Call Flask API
        response = requests.post("http://localhost:5001/analyze", json=trade_data)

        if response.status_code == 200:
            print(f"   ✅ AI Analysis Complete: {response.json()}")
        else:
            print(f"   ❌ AI API Error [{response.status_code}]: {response.text}")

    except Exception as e:
        print(f"   ❌ Error processing trade {trade_id}: {e}")


def listen_for_events():
    """
    Continuously listens for TradeCreated events from the blockchain.
    """
    print("\n🎧 Starting Blockchain Event Listener...")
    print(f"   Watching TradeCreated events on: {TRADE_CONTRACT.address}\n")

    try:
        if not TRADE_CONTRACT:
            print("⚠️ Skipping blockchain call, contract not available.")
            return
        event_filter = TRADE_CONTRACT.events.TradeCreated.create_filter(fromBlock='latest')
    except Exception as e:
        print(f"❌ Failed to create event filter: {e}")
        return

    while True:
        try:
            for event in event_filter.get_new_entries():
                handle_event(event)
        except Exception as e:
            print(f"\n⚠️ Error in event loop: {e}\nRetrying in 30s...\n")
            time.sleep(30)
            continue

        time.sleep(10)  # Polling interval


if __name__ == '__main__':
    listen_for_events()