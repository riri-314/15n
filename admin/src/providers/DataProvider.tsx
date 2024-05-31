import React, { useContext, useEffect, useState } from "react";
import { db } from "../firebase_config";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

interface DataProviderProps {
  children: React.ReactNode;
}

//export const DataContext = React.createContext<DocumentData | null>(null);
export const DataContext = React.createContext<DataContextValue | null>(null);

interface DataContextValue {
  publicData: Map<string, any> | null;
  privateData: Map<string, any> | null;
  quinzaineData: Map<string, any> | null;
  refetchPublicData: (id?: number | null) => void;
  refetchPrivateData: (id?: number | null) => Promise<Map<string, any>>;
  refetchQuinzaineData: () => Promise<Map<string, any>>;
  loadingPrivate: boolean;
  loadingPublic: boolean;
  loadingQuinzaine: boolean;
  fetchedTimePrivatePublic: number;
  fetchedTimeQuinzaine: number;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [publicData, setData] = useState<Map<string, any> | null>(null);
  const [privateData, setPrivateData] = useState<Map<string, any> | null>(null);
  const [quinzaineData, setQuinzaineData] = useState<Map<string, any> | null>(
    null
  );
  const [loadingPrivate, setLoadingPrivate] = useState<boolean>(false);
  const [loadingPublic, setLoadingPublic] = useState<boolean>(false);
  const [loadingQuinzaine, setLoadingQuinzaine] = useState<boolean>(false);
  const [fetchedTimePrivatePublic, setFetchedTimePrivatePublic] =
    useState<number>(0);
  const [fetchedTimeQuinzaine, setFetchedTimeQuinzaine] = useState<number>(0);

  const fetchPublicData = async (
    id: number | null = null
  ): Promise<Map<string, any>> => {
    setLoadingPublic(true);
    var articlesMap = new Map();
    try {
      const publicRef = collection(db, "Public");
      let queryDocs;
      if (id) {
        queryDocs = query(publicRef, where("edition", "==", Number(id)));
      } else {
        queryDocs = query(
          publicRef,
          where("active", "==", true),
          orderBy("edition", "desc")
        );
      }

      // get the docs set to active
      const docs = await getDocs(queryDocs);

      if (!docs.empty) {
        let edition: Number = Number.MIN_VALUE;
        //let articlesMap = new Map();

        docs.forEach((doc) => {
          const docData = doc.data();
          // console.log("docData", docData);
          // discard the doc if it has a lower edition number
          if (docData.edition > edition) {
            edition = docData.edition;
            articlesMap = new Map(Object.entries(docData));
            // i have to make a new map for the articles
            articlesMap.set("articles", new Map());
            // add the articles to the new map
            Object.entries(docData.articles).forEach(([barcode, article]) => {
              articlesMap.get("articles").set(barcode, article);
            });
          } else if (docData.edition === edition) {
            // merge the articles if the edition number is the same
            Object.entries(docData.articles).forEach(([barcode, article]) => {
              articlesMap.get("articles").set(barcode, article);
            });
          }
        });
        // remove the count and num entry if they exist
        articlesMap.delete("count");
        articlesMap.delete("num");
        console.log("public data", articlesMap);
        setFetchedTimePrivatePublic(Date.now());
        setData(articlesMap);
        setLoadingPublic(false);
        return articlesMap;
      } else {
        console.log("No active documents found in public data");
        setLoadingPublic(false);
        return articlesMap;
      }
    } catch (error) {
      setLoadingPublic(false);
      console.error("Error fetching data in public data:", error);
      return articlesMap;
    }
  };

  const fetchPrivateData = async (
    id: number | null = null
  ): Promise<Map<string, any>> => {
    let dataMap = new Map();

    setLoadingPrivate(true);
    //await new Promise((resolve) => setTimeout(resolve, 6000));

    try {
      // Call fetchPublicData
      let fetchedData;
      if (id) {
        fetchedData = await fetchPublicData(id);
      } else {
        fetchedData = await fetchPublicData();
      }

      // Access the id field from the articlesMap
      if (fetchedData.size > 0) {
        const edition = fetchedData.get("edition");
        console.log("Edition:", edition);
        const privateArticlesRef = collection(
          db,
          "Private",
          String(edition),
          "articles"
        );
        const private15nRef = collection(db, "Private");

        // get the docs set to active
        try {
          const docs = await getDocs(privateArticlesRef);
          const docs15n = await getDocs(private15nRef);
          if (!docs.empty && !docs15n.empty) {
            const articles = new Map(fetchedData.get("articles")); // deep copies the articles map

            for (const doc of docs.docs) {
              const docData = doc.data();
              //Start New
              const articlesT: Record<string, any> = docData.articles;
              for (const [articleId, articleData] of Object.entries(
                articlesT
              )) {
                let articleObject = fetchedData.get("articles").get(articleId);
                articleObject = { ...articleObject, ...articleData };
                articles.set(articleId, articleObject);
              }
              //End New
            }
            fetchedData.set("articles", articles); // add new article map to the fetchedData
            // put the 15n data in a new map
            fetchedData.set("15n", new Map());
            for (const doc of docs15n.docs) {
              const docId = doc.id;
              const docData = doc.data();
              fetchedData.get("15n").set(docId, docData);
            }
            console.log("Private data:", fetchedData);
            // set Private data to the fetchedData
            setPrivateData(fetchedData);
            setLoadingPrivate(false);
            return fetchedData;
          } else {
            console.log("No private data fetched");
            setLoadingPrivate(false);
            return dataMap;
          }
        } catch (error) {
          console.error("Error fetching private data:", error);
          setLoadingPrivate(false);
          return dataMap;
        }
      } else {
        console.log("No public data fetched in fetchPrivateData");
        setLoadingPrivate(false);
        return dataMap;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoadingPrivate(false);
      return dataMap;
    }
  };

  const fetchQuinzaineData = async (): Promise<Map<string, any>> => {
    setLoadingQuinzaine(true);
    //await new Promise((resolve) => setTimeout(resolve, 6000));
    const publicRef = collection(db, "Public");
    const privateRef = collection(db, "Private");
    let quinzaineMap = new Map();
    quinzaineMap.set("15n", new Map());
    let active;
    let articles: Record<string, any> = {};
    try {
      const fetchedData = await fetchPublicData();
      const currentEdition = Number(fetchedData.get("edition"));
      const publicDocs = await getDocs(publicRef);
      const privateDocs = await getDocs(privateRef);
      let maxEdition: Number = Number.MIN_VALUE;

      if (!publicDocs.empty && !privateDocs.empty) {
        for (const doc of publicDocs.docs) {
          const docData = doc.data();
          const qnzId = Number(docData.edition);
          if (qnzId > maxEdition.valueOf()) {
            maxEdition = qnzId;
            articles = { ...docData.articles };
          } else if (qnzId == maxEdition.valueOf()) {
            articles = { ...articles, ...docData.articles };
          }
          if (docData.active) {
            active = qnzId;
          }
          quinzaineMap.get("15n").set(qnzId, docData);
          if (qnzId === currentEdition) {
            quinzaineMap.get("15n").get(qnzId).current = true;
            quinzaineMap.set("current", qnzId); //redondent but easyer to access
          } else {
            quinzaineMap.get("15n").get(qnzId).current = false;
          }
        }
        // add 15n private data
        // get all docs inside private. Link doc.id to the map fields
        for (const doc of privateDocs.docs) {
          const docData = doc.data();
          let qnznData = quinzaineMap.get("15n").get(Number(doc.id));
          if (qnznData) {
            quinzaineMap
              .get("15n")
              .set(Number(doc.id), { ...qnznData, ...docData });
          } else {
            quinzaineMap.get("15n").set(Number(doc.id), docData);
          }
        }

        // should get the 15n with the biggest id ?

        //START USELESS ??
        const privateArticleRef = collection(
          db,
          "Private",
          String(maxEdition),
          "articles"
        );
        const snapchot = await getDocs(privateArticleRef);
        if (!snapchot.empty) {
          snapchot.forEach((document) => {
            const docData = document.data();
            const articlesT: Record<string, any> = docData.articles;
            for (const [articleId, articleData] of Object.entries(articlesT)) {
              let articleObject = articles[articleId];
              articleObject = { ...articleObject, ...articleData };
              articles[articleId] = articleObject;
            }
          });
        } else {
          console.log("No private data found for active quinzaine");
          setLoadingQuinzaine(false);
          return quinzaineMap;
        }
        quinzaineMap.get("15n").get(maxEdition).articles = articles; // all privates articles
        //END USELESS ??

        quinzaineMap.set("active", active); // active quinzaine
        quinzaineMap.set("maxId", maxEdition); // the biggest qnzn id
        console.log("Quinzaine data:", quinzaineMap);
        setQuinzaineData(quinzaineMap);
        setFetchedTimeQuinzaine(Date.now());
        setLoadingQuinzaine(false);
        return quinzaineMap;
      } else {
        console.log("No quinzaine data fetched");
        setLoadingQuinzaine(false);
        return quinzaineMap;
      }
    } catch (error) {
      console.log("Error fetching quinziane data:", error);
      setLoadingQuinzaine(false);
      return quinzaineMap;
    }
  };

  useEffect(() => {
    fetchPublicData(); // Initial data fetch
    //fetchPrivateData();
  }, []);

  const refetchPublicData = (id: number | null = null) => {
    if (!publicData) {
      fetchPublicData();
    } else {
      if (id) {
        fetchPublicData(id);
      } else {
        fetchPublicData(publicData.get("edition"));
      }
    }
  };

  const refetchPrivateData = async (
    id: number | null = null
  ): Promise<Map<string, any>> => {
    if (!privateData) {
      return fetchPrivateData();
    } else {
      if (id) {
        return fetchPrivateData(id);
      } else {
        return fetchPrivateData(privateData.get("edition"));
      }
    }
  };

  const refetchQuinzaineData = (): Promise<Map<string, any>> => {
    return fetchQuinzaineData(); // Function to refetch data
  };

  return (
    <DataContext.Provider
      value={{
        publicData,
        privateData,
        quinzaineData,
        refetchPublicData,
        refetchPrivateData,
        refetchQuinzaineData,
        loadingPrivate,
        loadingPublic,
        loadingQuinzaine,
        fetchedTimePrivatePublic,
        fetchedTimeQuinzaine,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  return useContext(DataContext) as DataContextValue;
};
