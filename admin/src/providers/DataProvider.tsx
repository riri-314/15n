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
  //  fetchTest: Map<string, any> | null;
  refetchPublicData: (id?: number | null) => void;
  refetchPrivateData: (id?: number | null) => Promise<Map<string, any>>;
  refetchQuinzaineData: (id?: number | null) => Promise<Map<string, any>>;
  loadingPrivate: boolean;
  loadingPublic: boolean;
  loadingQuinzaine: boolean;
  fetchedTimePublic: number;
  fetchedTimePrivate: number;
  fetchedTimeQuinzaine: number;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [publicData, setPublicData] = useState<Map<string, any> | null>(null);
  const [privateData, setPrivateData] = useState<Map<string, any> | null>(null);
  const [quinzaineData, setQuinzaineData] = useState<Map<string, any> | null>(
    null
  );
  const [loadingPrivate, setLoadingPrivate] = useState<boolean>(false);
  const [loadingPublic, setLoadingPublic] = useState<boolean>(false);
  const [loadingQuinzaine, setLoadingQuinzaine] = useState<boolean>(false);
  const [fetchedTimePublic, setFetchedTimePublic] = useState<number>(0);
  const [fetchedTimePrivate, setFetchedTimePrivate] = useState<number>(0);
  const [fetchedTimeQuinzaine, setFetchedTimeQuinzaine] = useState<number>(0);

  // When accessing stock/carte fetch a doc and if the modified date is biger than the local fetch time, refetch. Dont refetch otherwise.

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

        docs.forEach((doc) => {
          const docData = doc.data();
          // discard the doc if it has a lower edition number
          if (docData.edition > edition) {
            edition = docData.edition;
            const tag = docData.tag;
            const type = docData.type;
            articlesMap = new Map(Object.entries(docData));
            // i have to make a new map for the articles
            articlesMap.set("articles", new Map());
            // add the articles to the new map
            Object.entries(docData.articles).forEach(
              ([articleId, article]: [any, any]) => {
                // modifie article object to translate tags
                const typeId = article.type;
                article.type = type[typeId];
                let arr: any[] = [];
                article.tag.forEach((tagId: any) => {
                  arr.push(tag[tagId]);
                });
                article.tag = arr;
                articlesMap.get("articles").set(articleId, article);
              }
            );
          }
        });
        console.log("public data", articlesMap);
        // store the public data in local storage. This is the only data that is stored in local storage; Really needed? Yes
        // Needed when going from carte to scanner when offline.

        // scanner listen to the public doc. When public doc is updated it check if someone is scanning. If not scanning it refresh. If scanning it send notification
        setFetchedTimePublic(Date.now());
        setPublicData(articlesMap);
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
        console.log("Current edition:", edition);
        const privateArticlesRef = collection(
          db,
          "Private",
          String(edition),
          "articles"
        );
        //const private15nRef = collection(db, "Private");

        // get the docs set to active
        try {
          const docs = await getDocs(privateArticlesRef);
          //const docs15n = await getDocs(private15nRef);
          if (!docs.empty) {
            const articles = new Map(fetchedData.get("articles")); // deep copies the articles map

            for (const doc of docs.docs) {
              const docData = doc.data();
              const articleId = doc.id;
              //Start New

              let articleObject = fetchedData.get("articles").get(articleId);
              articleObject = { ...articleObject, ...docData };
              articles.set(articleId, articleObject);

              //End New
            }
            fetchedData.set("articles", articles); // add new article map to the fetchedData
            // put the 15n data in a new map
            //fetchedData.set("15n", new Map());
            //for (const doc of docs15n.docs) {
            //  const docId = doc.id;
            //  const docData = doc.data();
            //  fetchedData.get("15n").set(docId, docData);
            //}
            console.log("Private data:", fetchedData);
            // set Private data to the fetchedData
            setPrivateData(fetchedData);
            setFetchedTimePrivate(Date.now());
            setLoadingPrivate(false);
            return fetchedData;
          } else {
            console.log("No private data fetched");
            setPrivateData(null);
            setLoadingPrivate(false);
            return dataMap;
          }
        } catch (error) {
          console.error("Error fetching private data:", error);
          setPrivateData(null);
          setLoadingPrivate(false);
          return dataMap;
        }
      } else {
        console.log("No public data fetched in fetchPrivateData");
        setPrivateData(null);
        setLoadingPrivate(false);
        return dataMap;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setPrivateData(null);
      setLoadingPrivate(false);
      return dataMap;
    }
  };

  const fetchQuinzaineData = async (
    id: number | null = null
  ): Promise<Map<string, any>> => {
    setLoadingQuinzaine(true);
    try {
      let fetchedData = null;
      const publicRef = collection(db, "Public");
      if (id) {
        // fetch private data with id
        fetchedData = await fetchPrivateData(id);
        // fetch default 15n id
        const doc = await getDocs(
          query(publicRef, where("active", "==", true))
        );
        if (!doc.empty) {
          const docData = doc.docs[0].data();
          fetchedData.set("defaultEdition", Number(docData.edition)); //the edition that will load by default
          fetchedData.set("currentEdition", Number(id)); // the editiont that is currently loaded
        } else {
          console.log("No active quinzaine found");
          setQuinzaineData(null);
          setLoadingQuinzaine(false);
          return new Map();
        }
      } else {
        fetchedData = await fetchPrivateData();
        fetchedData.set("defaultEdition", Number(fetchedData.get("edition")));
        fetchedData.set("currentEdition", Number(fetchedData.get("edition")));
      }
      // get 15s data
      const quinznRef = collection(db, "Quinzaines");
      const qnzDocs = await getDocs(quinznRef);
      // console.log("Quinzaines data DEBUG:", qnzDocs);
      if (!qnzDocs.empty) {
        let quinzaines = new Map();
        let maxEdition: Number = Number.MIN_VALUE;
        qnzDocs.forEach((doc) => {
          const docData = doc.data();
          // console.log("Quinzaines data DEBUG:", docData);
          const qnzId = Number(doc.id);
          quinzaines.set(qnzId, docData);
          if (qnzId > maxEdition.valueOf()) {
            maxEdition = qnzId;
          }
        });
        // change
        // console.log("Quinzaines data:", quinzaines);
        fetchedData.set("15n", quinzaines);
        // set the max number 15n
        fetchedData.set("maxEdition", Number(maxEdition));
        // we need the default active quinzaine
        console.log("Quinzaine data:", fetchedData);
        setQuinzaineData(fetchedData);
        setFetchedTimeQuinzaine(Date.now());
        setLoadingQuinzaine(false);
        return fetchedData;
      } else {
        console.log("No quinzaine data fetched");
        setQuinzaineData(null);
        setLoadingQuinzaine(false);
        return new Map();
      }
    } catch (error) {
      console.log("Error fetching quinzaine data:", error);
      setQuinzaineData(null);
      setLoadingQuinzaine(false);
      return new Map();
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

  const refetchQuinzaineData = async (
    id: number | null = null
  ): Promise<Map<string, any>> => {
    console.log("Refetching quinzaine data");
    return fetchQuinzaineData(id); // Function to refetch data
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
        fetchedTimePublic,
        fetchedTimePrivate,
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
