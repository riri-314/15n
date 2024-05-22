import React, { useContext, useEffect, useState } from "react";
import { db } from "../firebase_config";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

interface DataProviderProps {
  children: React.ReactNode;
}

//export const DataContext = React.createContext<DocumentData | null>(null);
export const DataContext = React.createContext<DataContextValue | null>(null);

interface DataContextValue {
  publicData: Map<string, any> | null;
  privateData: Map<string, any> | null;
  refetchPublicData: () => void;
  refetchPrivateData: () => void;
  loading: boolean;
  fetchedTime: number;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [publicData, setData] = useState<Map<string, any> | null>(null);
  const [privateData, setPrivateData] = useState<Map<string, any> | null>(null);
  const [fetchedTime, setFetchedTime] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPublicData = async (): Promise<Map<string, any>> => {
    let articlesMap = new Map();
    try {
      const publicRef = collection(db, "publicTest");
      const queryDocs = query(
        publicRef,
        where("active", "==", true),
        orderBy("edition", "desc")
      );

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
        console.log("public data", articlesMap);
        setFetchedTime(Date.now());
        setData(articlesMap);
        return articlesMap;
      } else {
        console.log("No active documents found in public data");
        return articlesMap;
      }
    } catch (error) {
      console.error("Error fetching data in public data:", error);
      return articlesMap;
    }
  };

  const fetchPrivateData = async () => {
    setLoading(true);
    try {
      // Call fetchPublicData
      const fetchedData = await fetchPublicData();

      // Access the id field from the articlesMap
      if (fetchedData.size > 0) {
        const edition = fetchedData.get("edition");
        console.log("Edition:", edition);
        const privateArticlesRef = collection(db, "private", String(edition), "articles");
        const private15nRef = collection(db, "private");

        // get the docs set to active
        try {
          const docs = await getDocs(privateArticlesRef);
          const docs15n = await getDocs(private15nRef);
          if (!docs.empty && !docs15n.empty) {
            for (const doc of docs.docs) {
              const docId = doc.id;
              const docData = doc.data();
              //console.log("Private data fetched:", docId, docData);
              // append the private data to the aticles map of the fetchedData
              fetchedData.get("articles").set(docId, docData);
            }
            for (const doc of docs15n.docs) {
              const docId = doc.id;
              const docData = doc.data();
              //console.log("Private data fetched:", docId, docData);
              // append the private data to the aticles map of the fetchedData
              fetchedData.set(docId, docData);
            }
            console.log("Private data:", fetchedData);
            // set Private data to the fetchedData
            setPrivateData(fetchedData);
            setLoading(false);
          } else {
            console.log("No private data fetched");
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching private data:", error);
          setLoading(false);
        }
      } else {
        console.log("No public data fetched in fetchPrivateData");
        setLoading(false);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData(); // Initial data fetch
    //fetchPrivateData();
  }, []);

  const refetchPublicData = () => {
    fetchPublicData(); // Function to refetch data
  };

  const refetchPrivateData = () => {
    fetchPrivateData(); // Function to refetch data
  }

  return (
    <DataContext.Provider value={{ publicData, privateData, refetchPublicData, refetchPrivateData, loading, fetchedTime }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  return useContext(DataContext) as DataContextValue;
};
