import Refresh from "../../components/refresh/Refresh";
import QuinzainesTable from "./QuinzainesTable";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Modal, Stack } from "@mui/material";
import { useState } from "react";
import QuinzaineEdit from "./QuinzaineEdit";
import NewQuinzaine from "./NewQuinzaine";
import { useData } from "../../providers/DataProvider";

export default function AdminView() {
  const [openModalComitard, setOpenModalQuinzaine] = useState(false);
  const [modal15nData, setModal15nData] = useState<any | null>(null);
  const { quinzaineData } = useData();

  const tableText = (
    <Card
      sx={{ minWidth: 275, boxShadow: 0, border: 1, borderColor: "divider" }}
    >
      <CardContent>
        <Typography variant="h5" component="div">
          Quinzaine table <b>Danger Zone</b>
        </Typography>
        <Typography variant="body2">
          Ce tableau affiche les quinzaines dans la base de données. Cliquez sur
          le bouton id pour définir la quinzaine comme active. Cliquez sur le
          bouton edit pour éditer les données de la quinzaine.{" "}
          <b>Soyez prudent, ne soyez pas stupide.</b>
          <br />
          Tu es actuellement en train de voir les données pour la{" "}
          {quinzaineData?.get("currentEdition")}éme quinzaine. Par défaut, vous
          verrez les données pour la {quinzaineData?.get("defaultEdition")}éme
          quinzaine car c'est celle qui est définie par defaut.
          <br />
          <b>Active: </b>C'est la quinzaine que vous voyez pour le moment.
          <br />
          <b>Defaut: </b>C'est la quinzaine qui sera chargée par defaut.{" "}
          <b>Soyez prudent!</b>
        </Typography>
      </CardContent>
    </Card>
  );

  // Let user create a new quinzaine if maxEdition == currentEdition. If not, show a message.
  const formText = (
    <Card
      sx={{ minWidth: 275, boxShadow: 0, border: 1, borderColor: "divider" }}
    >
      <CardContent>
        <Typography variant="h5" component="div">
          Créer une Quinzaine
        </Typography>
        <Typography variant="body2">
          Créer une nouvelle quinzaine. Créer la{" "}
          {quinzaineData?.get("maxEdition") + 1}éme édition basée sur les
          données de la {quinzaineData?.get("maxEdition")}éme édition. Comment
          faire? Entrer le nom du chez 15N, cliquer sur le bouton, attendre et
          ne surtout par fermer la page web. Enjoy!
        </Typography>
      </CardContent>
    </Card>
  );

  function displayNewQuinzaineForm() {
    if (
      quinzaineData?.get("maxEdition") === quinzaineData?.get("currentEdition")
    ) {
      return (
        <>
          {formText} <NewQuinzaine />
        </>
      );
    } else {
      return (
        <Card
          sx={{
            minWidth: 275,
            boxShadow: 0,
            border: 1,
            borderColor: "divider",
          }}
        >
          <CardContent>
            <Typography variant="h5" component="div">
              Créer une Quinzaine
            </Typography>
            <Typography variant="body2">
              Vous ne pouvez pas créer une nouvelle quinzaine pour le moment.
              Pour créer la {quinzaineData?.get("maxEdition") + 1}éme édition
              basée sur les données de la {quinzaineData?.get("maxEdition")}éme
              édition, vous devez d'abord définir la{" "}
              {quinzaineData?.get("maxEdition")}éme édition comme active.
              <br />
              Rappel:
              <br />
              <b>Active: </b>C'est la quinzaine que vous voyez pour le moment.
              <br />
              <b>Defaut: </b>C'est la quinzaine qui sera chargée par defaut.{" "}
            </Typography>
          </CardContent>
        </Card>
      );
    }
  }

  return (
    <>
      <Refresh mode="quinzaine" />
      <Stack spacing={3}>
        {tableText}
        <div>
          <QuinzainesTable
            handleOpenModal={(data: any) => {
              setModal15nData(data);
              setOpenModalQuinzaine(true);
              console.log("Modal data: ", data);
            }}
          />
        </div>
        {displayNewQuinzaineForm()}
        <div style={{ paddingTop: 3 }}></div>
      </Stack>
      <Modal
        open={openModalComitard}
        onClose={() => setOpenModalQuinzaine(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          m: 3,
          overflow: "scroll",
          maxWidth: 800,
          ml: "auto",
          mr: "auto",
          zIndex: 100,
        }}
      >
        <QuinzaineEdit
          data={modal15nData}
          close={() => setOpenModalQuinzaine(false)}
        />
      </Modal>
    </>
  );
}
