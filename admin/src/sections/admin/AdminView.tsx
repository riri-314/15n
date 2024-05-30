import Refresh from "../../components/refresh/Refresh";
import QuinzainesTable from "./QuinzainesTable";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Modal, Stack } from "@mui/material";
import { useState } from "react";
import QuinzaineEdit from "./QuinzaineEdit";
import NewQuinzaine from "./NewQuinzaine";

const tableText = (
  <Card sx={{ minWidth: 275, boxShadow: 0, border: 1, borderColor: "divider" }}>
    <CardContent>
      <Typography variant="h5" component="div">
        Quinzaine table
      </Typography>
      <Typography variant="body2">
        This table displays the quinzaines in the database. Click on the id
        button to set the quinzaine as active. Click on the edit button to edit
        the quinzaine data. Be carful, dont be stupid.
      </Typography>
    </CardContent>
  </Card>
);

export default function AdminView() {
  const [openModalComitard, setOpenModalComitard] = useState(false);
  const [modal15nData, setModal15nData] = useState<any | null>(null);
  return (
    <>
      <Refresh mode="private" />
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
        <NewQuinzaine />
        <div style={{paddingTop: 3}}></div>
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
        <QuinzaineEdit data={modal15nData} close={() => setOpenModalComitard(false)} />
      </Modal>
    </>
  );
}
