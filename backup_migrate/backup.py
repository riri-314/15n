import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1._helpers import DatetimeWithNanoseconds
from datetime import datetime

# Initialize Firebase admin SDK with credentials
cred = credentials.Certificate("quinzaine-3fb2e-firebase-adminsdk-b0oop-3ac37556df.json")
firebase_admin.initialize_app(cred)

# Access the Firestore database
db = firestore.client()

def convert_firestore_data(data):
    """
    Recursively converts Firestore data to a JSON serializable format.
    Specifically handles Firestore DatetimeWithNanoseconds objects.
    """
    if isinstance(data, DatetimeWithNanoseconds):
        # Convert Firestore DatetimeWithNanoseconds to ISO 8601 string
        return data.isoformat()
    elif isinstance(data, dict):
        # Recursively convert dictionary values
        return {k: convert_firestore_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        # Recursively convert list elements
        return [convert_firestore_data(i) for i in data]
    else:
        # Return the data as-is if no conversion is needed
        return data

def backup_document(doc_ref, doc_data, backup_path):
    """
    Backup a single Firestore document to a local file.
    :param doc_ref: Reference to the document
    :param doc_data: The document's data (dictionary)
    :param backup_path: Path to store the document JSON file
    """
    doc_id = doc_ref.id
    doc_file_path = os.path.join(backup_path, f'{doc_id}.json')

    # Convert Firestore data to JSON serializable format
    serializable_data = convert_firestore_data(doc_data)

    # Save the document data to a JSON file
    with open(doc_file_path, 'w') as f:
        json.dump(serializable_data, f, indent=4)

    print(f"Backed up document: {doc_id} to {doc_file_path}")

    # Now, check for subcollections in this document
    subcollections = doc_ref.collections()
    for subcollection in subcollections:
        subcollection_backup_path = os.path.join(backup_path, doc_id)
        os.makedirs(subcollection_backup_path, exist_ok=True)
        print(f"Backing up subcollection: {subcollection.id} for document {doc_id}")
        backup_collection(subcollection, subcollection_backup_path)

def backup_collection(collection_ref, backup_path):
    """
    Recursively backup a Firestore collection.
    :param collection_ref: Firestore collection reference
    :param backup_path: Path to store collection backups locally
    """
    # Get all documents in the collection
    docs = collection_ref.stream()

    # Ensure the directory exists for this collection
    os.makedirs(backup_path, exist_ok=True)

    for doc in docs:
        doc_data = doc.to_dict()
        backup_document(doc.reference, doc_data, backup_path)

def backup_firestore(backup_root_dir):
    """
    Recursively backup Firestore database starting from the root collections.
    :param backup_root_dir: Local directory where the backups will be stored
    """
    # Get all root collections in Firestore
    collections = db.collections()

    for collection in collections:
        collection_backup_path = os.path.join(backup_root_dir, collection.id)
        print(f"Backing up collection: {collection.id} to {collection_backup_path}")
        backup_collection(collection, collection_backup_path)

if __name__ == '__main__':
    # Specify where to save the backups
    # Specify where to save the backups
    current_datetime = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_directory = f'./firestore_backup_{current_datetime}'  # Local directory to save backups
    backup_firestore(backup_directory)
