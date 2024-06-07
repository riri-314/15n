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
  const [openModalComitard, setOpenModalComitard] = useState(false);
  const [modal15nData, setModal15nData] = useState<any | null>(null);
  const { quinzaineData } = useData();


  const tableText = (
    <Card sx={{ minWidth: 275, boxShadow: 0, border: 1, borderColor: "divider" }}>
      <CardContent>
        <Typography variant="h5" component="div">
          Quinzaine table <b>Danger Zone</b>
        </Typography>
        <Typography variant="body2">
          This table displays the quinzaines in the database. Click on the id
          button to set the quinzaine as active. Click on the edit button to edit
          the quinzaine data. <b>Be carful, dont be stupid.</b>
          <br />
          You are currently seeing the data for the {quinzaineData?.get("current")}th quinzaine. By default you
          well see data for the {quinzaineData?.get("active")}th quinzaine as this is the one set as active.
          <br />
          <b>Active: </b>This is the quinzaine that will be loaded by default when
          the app is opened. <b>Be carful</b>
          <br />
          <b>Current: </b>This is the quinzaine that is currently being displayed
          in the app. By default, this is the same as the active quinzaine.
        </Typography>
      </CardContent>
    </Card>
  );

  const formText = (
    <Card sx={{ minWidth: 275, boxShadow: 0, border: 1, borderColor: "divider" }}>
      <CardContent>
        <Typography variant="h5" component="div">
          Qiunzaine form
        </Typography>
        <Typography variant="body2">
          Create a new edition. Create the {quinzaineData?.get("maxId") + 1}th edition based on data from the {quinzaineData?.get("maxId")}th edition 
        </Typography>
      </CardContent>
    </Card>
  );
  

  return (
    <>
      <Refresh mode="quinzaine" />
      <Stack spacing={3}>
        {tableText}
        <div>
          <QuinzainesTable
            handleOpenModal={(data: any) => {
              setModal15nData(data);
              setOpenModalComitard(true);
              console.log("data: ", data);
            }}
          />
        </div>
        {formText}
        <NewQuinzaine />
        <div style={{ paddingTop: 3 }}></div>
      </Stack>
      <Modal
        open={openModalComitard}
        onClose={() => setOpenModalComitard(false)}
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
          close={() => setOpenModalComitard(false)}
        />
      </Modal>
    </>
  );
}
