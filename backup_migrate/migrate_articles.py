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

def create_article(article_id, article_data):
    """
    Create or update an article in Firestore with the given ID.
    """
    article_ref = db.collection('Private').document(article_id)
    article_ref.set(article_data)
    print(f"Article {article_id} created/updated successfully.")


def migrate_articles():

    articles_ref = db.collection('articles')
    articles = articles_ref.stream()
    i = 0

    
    for article in articles:
        i += 1
        #if i > 2:
        #    break
        articleData = article.to_dict()
        articleId = article.id
        hasBarcode = articleData.get('hasbarcode', False) #pub
        creationDate = articleData.get('creation_date', None) #pub
        idDelsart = articleData.get('id_delsart', None) #pub
        updatedTime = articleData.get('updated_time', None) #pub
        print(f"Migrating article: {articleId}")
        #migrateData = {'has_barcode':hasBarcode, 'creation_date':creationDate, 'id_delsart':idDelsart, 'updated_time':updatedTime}

        # get the docs in info collection
        info_ref = db.collection('articles').document(articleId).collection('infos')
        # get the docs in info collection
        info = info_ref.stream()
        for doc in info:
            docData = doc.to_dict()
            docId = doc.id
            
            article_ref = db.collection('Public').document(docId)
            
            # Update the nested field 'articles.articleId'
            nested_field_update = {
                f'articles.{articleId}.has_barcode': hasBarcode,
                f'articles.{articleId}.creation_date': creationDate,
                f'articles.{articleId}.id_delsart': idDelsart,
                f'articles.{articleId}.updated_time': updatedTime
            }
            article_ref.update(nested_field_update)
            
            print(f"Migrating info: {docId}")
            infoData = {'articleTransactions':docData.get('articleTransactions', None), 'edition':int(docId), 'price_in':docData.get('price_in', 0), 'sales':docData.get('sales', 0), 'stock':docData.get('stock', 0)}
            info_ref = db.collection('Private').document(str(docId)).collection('articles').document(articleId)
            info_ref.set(infoData)
        print(f"Article {articleId} created/updated successfully. {i}")
        #break
        

#migrate_articles()

#migrate public collection
def migrate_public():
    publicRef = db.collection('public')
    publics = publicRef.stream()

    for public in publics:
        publicData = public.to_dict()
        publicId = public.id
        articles = publicData.get('articles', None)
        #format articles
        for article in articles:
            tag = []
            articleData = articles.get(article, None)
            articleId = article
            articleType = articleData.get('type', 0)

            if articleType == 'Ambrée':
                articleType = 1
            elif articleType == 'Blanche':
                articleType = 2
            elif articleType == 'Blonde':
                articleType = 3
            elif articleType == 'Brune':
                articleType = 4
            elif articleType == 'Fruitée':
                articleType = 5
            elif articleType == 'Stout':
                articleType = 6
            elif articleType == 'Trappiste':
                articleType = 0
                tag.append(2)
            else:
                articleType = 0

            articleData['type'] = articleType

            #tag
            if articleData.get("new", False):
                #articleData['tag'] = [1]
                tag.append(1)
     
            articleData['tag'] = tag

            if "new" in articleData:
                del articleData["new"]

            
            print(f"Migrating article: {articleId}, {articleData.get('name', None)}")
            #print(f"Migrating article: {articleId}, {article.get('name', None)}")
        print(articles)
        active = False
        if int(publicId) == 90:
            active = True    
        publicData = {'active': active, 'articles':articles, 'average_stock_update_time':None, 'edition': int(publicId)}
        public_ref = db.collection('Public').document(publicId)
        public_ref.set(publicData)
        
        print(f"Public {publicId} created/updated successfully.")

#migrate_public()

def migrate_15n_data():
    QnzRef = db.collection("quinzaines")
    qnzs = QnzRef.stream()

    for qnz in qnzs:
        qnzData = qnz.to_dict()
        edition = qnzData.get("id", None)
        autor = qnzData.get("autor", None)
        creation_date = qnzData.get('creation_date', None)
        transaction_data = qnzData.get('data', None)
        year = qnzData.get('year', None)
        newData = {'edition': int(edition), 'autor':autor, 'creation_date': creation_date, 'transaction_data': transaction_data, 'year': year}
        print(newData)
        #qnzNewRef = db.collection('Quinzaines').document(str(edition))
        #qnzNewRef.set(newData)


#migrate_15n_data()


def add_tag_adn_type():
    publicRef = db.collection('Public')
    for x in [88,89,90]:
        publicDocRef = publicRef.document(str(x))
        publicDocRef.update({'tag': {'1': 'New', '2':'Trappiste', '3': 'Gluten Free', '4':'Triple'}, 'type': {'1': 'Ambrée', '2':'Blanche', '3':'Blonde', '4':'Brune', '5':'Fruitée', '6':'Stout', '0':'None'}})

#add_tag_adn_type()

#PUBLIC
#add beer type in public
#stock -> average stock (on scale 0 to 10)
#complete_update_time -> updated_time_stock ?

#QUINZAINES (is private)
#autor, creation_date, data -> transactionData, id -> edition, year
#random doc id to edition number

#Type:
#1 Ambrée
#2 Blanche
#3 Blonde
#4 Brune
#5 Fruitée
#6 Stout
#0 None

#Tag:
#1 New
#2 Trappiste
#3 Gluten Free
#4 Triple
