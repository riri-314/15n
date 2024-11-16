import { useEffect, useState } from "react";
import { useData } from "../../providers/DataProvider";
import ScannerTable from "../../sections/scanner/ScannerTable";
import AffondQuinzaine from "../../sections/scanner/Affond";
import React from "react";
import { doc, increment, writeBatch } from "firebase/firestore";
import { db } from "../../firebase_config";
import {
  getFormattedTimestamp,
  getRoundedTime,
} from "../../components/stock/salesAndStock";

const centeredTextStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  textAlign: "center",
  margin: "0rem",
};

const bigTextStyle: React.CSSProperties = {
  fontSize: "8rem",
  margin: "0rem",
};

const smallTextStyle: React.CSSProperties = {
  /* Styles for small screens */
  fontSize: "4rem", // Adjust the size as needed for small screens
  margin: "0rem",
};

interface scannerViewProps {
  unSend: number;
}

export default function ScannerView({ unSend }: scannerViewProps) {
  //const ScannerView = React.memo(function ScannerView() {
  const { publicDataListener } = useData();
  const [articles, setArticles] = useState<any[]>([]);
  const [newRowId, setNewRowId] = useState("");
  const [Price, setPrice] = useState(0);
  const [unsend, setUnsed] = useState(unSend);
  const [AlertVisibility, setAlertVisibility] = useState(false);
  const [AlertMessage, setAlertMessage] = useState("");
  const [AlertType, setAlertType] = useState("");
  const [AlertHigh, setAlertHigh] = useState("");
  let scanner = publicDataListener?.articles;
  let inputs: string[] = [];

  // update articles with the new data
  // update price_out with the new data
  // update Price with the new data
  useEffect(() => {
    scanner = publicDataListener?.articles;
    setArticles((prevArticles: any[]) => {
      // iterate over the articles and update the price
      let price = 0;
      const updatedArticles = [...prevArticles];
      prevArticles.forEach((article: any, index: number) => {
        //find the article in publicDataListener
        const foundKey: any = Object.keys(scanner).find(
          (key: any) => scanner[key].barcode === article.barcode
        );
        if (foundKey) {
          const Foundarticle = scanner[foundKey];
          price += Foundarticle.price_out * article.quantity;

          updatedArticles[index].price_out = Foundarticle.price_out;
        } else {
          console.log("no match for: ", article.barcode);
        }
      });
      setPrice(price);
      return updatedArticles;
    });
  }, [publicDataListener]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log("Key pressed:", event.key);
      handleKeyboardInput(event.key);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleKeyboardInput(key: string) {
    if (key == "Enter") {
      handleEnter();
    } else if (key == " ") {
      handleSpace();
    } else if (key.length == 1) {
      inputs.push(key);
    }
  }

  const handleEnter = () => {
    //Xconst barcode = inputs.join("");
    let barcode = "5425031950011";

    if (barcode == "obqd") {
      console.log("obqd");
      //OnSendDataToParent(true); //enter in alt mode or debug...
    } else if (barcode == "infos") {
      console.log("infos");
      //setShowInfoBox((prev) => { //show the info box
      //  return !prev;
      //});
    } else if (barcode.length == 0) {
      console.log("vilain canard");
      setAlertHigh("Erreur");
      setAlertMessage(
        "Appuyer sur espace pour envoyer le commande, pas sur enter. Petit con"
      );
      setAlertType("alert-warning");
      setAlertVisibility(true);
    } else {
      setArticles((prevArticles: any) => {
        //console.log("prevArticles: ", prevArticles);
        const existingArticle: any = Object.keys(prevArticles).find(
          (key: any) => prevArticles[key].barcode === barcode
        );
        if (existingArticle) {
          const updatedArticles = [...prevArticles];
          updatedArticles[existingArticle] = {
            ...updatedArticles[existingArticle],
            quantity: updatedArticles[existingArticle].quantity + 1,
          };
          setNewRowId(prevArticles[existingArticle].id);
          //console.log("new row: ", existingArticle);

          setPrice((prevPrice) => {
            const nw_price =
              prevPrice + prevArticles[existingArticle].price_out;
            return nw_price;
          });
          return updatedArticles;
        } else {
          //console.log("Scanner data: ", scanner);
          const foundKey: any = Object.keys(scanner).find(
            (key: any) => scanner[key].barcode === barcode
          );
          //console.log("foundKeyTest: ", foundKey);

          if (foundKey) {
            const Foundarticle = scanner[foundKey];
            //const Foundarticle = foundKey;
            let newArticle = {};
            if (Foundarticle.article_type == 1) {
              newArticle = {
                id: foundKey,
                barcode: Foundarticle.barcode,
                name: Foundarticle.name,
                format: Foundarticle.format,
                price_out: Foundarticle.price_out,
                article_type: Foundarticle.article_type,
                quantity: 1,
              };
            } else if (Foundarticle.article_type == 2) {
              newArticle = {
                id: foundKey,
                barcode: Foundarticle.barcode,
                name: Foundarticle.name,
                price_out: Foundarticle.price_out,
                article_type: Foundarticle.article_type,
                quantity: 1,
                products: Foundarticle.products,
                // add articles array if article_type == 2
              };
            } else if (Foundarticle.article_type == 3) {
              newArticle = {
                id: foundKey,
                barcode: Foundarticle.barcode,
                name: Foundarticle.name,
                price_out: Foundarticle.price_out,
                article_type: Foundarticle.article_type,
                quantity: 1,
              };
            } else {
              //error
              console.log("unknow article type in handle enter");
              return [...prevArticles];
            }

            setNewRowId(foundKey);
            console.log("new article found in db: ", foundKey);
            setPrice((prevPrice) => {
              const nw_price = prevPrice + Foundarticle.price_out;
              return nw_price;
            });
            return [...prevArticles, newArticle];
          } else {
            setAlertHigh("Erreur 404");
            setAlertMessage(
              `barcode ${barcode} ne correspond pas à un article dans la base de donnée`
            );
            setAlertType("alert-warning");
            setAlertVisibility(true);
            console.log("no match for: ", barcode);
          }
          return prevArticles;
        }
      });
    }

    inputs = [];
  };

  async function handleSpace() {
    try {
      setArticles((prevArticles) => {
        const result = sendData(prevArticles);
        console.log("result send data: ", result);
        setPrice(0);
        return [];
      });
    } catch (error) {
      // Handle error if necessary
      console.error(error);
    }
  }

  async function sendData(prevArticles: any): Promise<any> {
    //increment unsend by one, will be decremented by one once the function return
    const localUnsend = localStorage.getItem("unsend");
    if (localUnsend) {
      const dfg = JSON.parse(localUnsend);
      localStorage.setItem("unsend", JSON.stringify(dfg + 1));
      setUnsed(dfg + 1);
    } else {
      localStorage.setItem("unsend", JSON.stringify(1));
    }

    var qnz_docRef = doc(db, "Quinzaines", String(publicDataListener?.edition));

    let date = getFormattedTimestamp();
    let roundTime = getRoundedTime();
    let sales = `articleTransactions.${date}.${roundTime}.sales`;
    let beerCount = 0;
    let beerCountRef = `transactions.${date}.${roundTime}.beerCount`;
    let beerVolume = 0;
    let beerVolumeRef = `transactions.${date}.${roundTime}.beerVolume`;
    let articleCount = 0;
    let articleCountRef = `transactions.${date}.${roundTime}.articleCount`;
    let totalEuro = 0;
    let totalEuroRef = `transactions.${date}.${roundTime}.totalEuro`;

    //if one of the article is a plateau search in the other articles if similar article and increment quantity. if no match add article
    //const euroPlateau = updatePrevArticles(prevArticles);

    const batch = writeBatch(db);
    for (const article of prevArticles) {
      var docRef = doc(db, "Private", String(publicDataListener?.edition), "articles", article.id);

      if (article.article_type == 1) {
        //console.log("sending beer");
        beerCount += article.quantity;
        beerVolume += (article.quantity * article.format) / 100;
        totalEuro += article.price_out * article.quantity;
        batch.update(docRef, {
          [sales]: increment(article.quantity),
          sales: increment(article.quantity),
          stock: increment(-article.quantity), //dont touch stock_init
        });
      } else if (article.article_type == 2) {
        totalEuro += article.price_out * article.quantity; //if count euro from plateau, has to remove euro from beers that made the plateau
        articleCount += article.quantity;
        batch.update(docRef, {
          [sales]: increment(article.quantity),
          sales: increment(article.quantity),
        });
      } else if (article.article_type == 3) {
        totalEuro += article.price_out * article.quantity;
        articleCount += article.quantity;
        batch.update(docRef, {
          [sales]: increment(article.quantity),
          sales: increment(article.quantity),
          stock: increment(-article.quantity),
        });
      }
    }
    //totalEuro -= euroPlateau;
    batch.update(qnz_docRef, {
      [beerCountRef]: increment(beerCount),
      [beerVolumeRef]: increment(Number(beerVolume.toFixed(2))),
      [articleCountRef]: increment(articleCount),
      [totalEuroRef]: increment(Number(totalEuro.toFixed(2))),
    });

    //cant update public data (because of listener), update quinzaine doc to tel that there is a new update


    // add transaction to db
    await batch.commit().then(() => {
      console.log("data successfully sent");
      const unsett = localStorage.getItem("unsend");
      if (unsett) {
        const huyu = JSON.parse(unsett);
        localStorage.setItem("unsend", JSON.stringify(huyu - 1));
        window.dispatchEvent(new Event("storage"));
      }
    });

    return 1;
  }


  //update data to convert plateau into beers
  function updatePrevArticles(prevArticles: any[]): number {
    var plateauEuro = 0;

    const filteredDicts = prevArticles.filter(
      (dict) => dict.article_type === 2
    );
    //console.log("number of plateaux found: ", filteredDicts.length);
    if (filteredDicts.length === 0) {
      return 0;
    }

    filteredDicts.forEach((filteredDict) => {
      //console.log("plateau: ", filteredDict);
      const articles = filteredDict.products;
      //console.log("articles in plateau: ", articles);
      articles.forEach((article: string) => {
        const existingArticle: any = Object.keys(prevArticles).find(
          (key: any) => prevArticles[key].barcode === article
        );

        if (existingArticle) {
          prevArticles[existingArticle].quantity += filteredDict.quantity;
          plateauEuro +=
            prevArticles[existingArticle].price_out * filteredDict.quantity;
          //add to plateau euro. TODO
        } else {
          //search in scanner and add
          const foundKey: any = Object.keys(scanner).find(
            (key: any) => scanner[key].barcode === article
          );
          if (foundKey) {
            const Foundarticle = scanner[foundKey];
            let newArticle = {};
            if (Foundarticle.article_type == 1) {
              newArticle = {
                id: foundKey,
                barcode: Foundarticle.barcode,
                name: Foundarticle.name,
                format: Foundarticle.format,
                price_out: Foundarticle.price_out,
                article_type: Foundarticle.article_type,
                quantity: filteredDict.quantity,
              };
              plateauEuro += Foundarticle.price_out * filteredDict.quantity;
              prevArticles.push(newArticle);
            } else if (Foundarticle.article_type == 3) {
              newArticle = {
                id: foundKey,
                barcode: Foundarticle.barcode,
                name: Foundarticle.name,
                price_out: Foundarticle.price_out,
                article_type: Foundarticle.article_type,
                quantity: filteredDict.quantity,
              };
              plateauEuro += Foundarticle.price_out * filteredDict.quantity;
              prevArticles.push(newArticle);
            } else {
              //error
              console.log(
                "unsuported article type in data -> updatePrevArticles"
              );
            }
          } else {
            console.log(
              "error in sending data -> updatePrevArticles, article in barcode not found"
            );
          }
        }
      });
    });
    return plateauEuro;
  }

  const handleArticleRemoval = (articleId: string) => {
    const existingArticle: any = Object.keys(articles).find(
      (key: any) => articles[key].id === articleId
    );

    const updatedArticles = [...articles];
    updatedArticles[existingArticle] = {
      ...updatedArticles[existingArticle],
      quantity: updatedArticles[existingArticle].quantity - 1,
    };

    if (updatedArticles[existingArticle].quantity <= 0) {
      updatedArticles.splice(existingArticle, 1);
    }

    const tmp = Price - articles[existingArticle].price_out;
    setPrice(tmp);
    setArticles(updatedArticles);
    console.log("Updated articles from remove: ", updatedArticles);
  };


  return (
    <>
      <div style={centeredTextStyle}>
        <h1 style={window.innerWidth >= 768 ? bigTextStyle : smallTextStyle}>
          Total: {Price.toFixed(2).replace(/\.?0+$/, "")}€
        </h1>
      </div>
      <ScannerTable
        TableData={articles}
        newRowId={newRowId}
        handleArticleRemoval={handleArticleRemoval}
      />
      <AffondQuinzaine />
    </>
  );
}
