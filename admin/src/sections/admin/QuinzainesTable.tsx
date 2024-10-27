import { Alert, AlertColor, alpha, styled } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridCellParams,
  gridClasses,
  GridRowParams,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import { useData } from "../../providers/DataProvider";
import Iconify from "../../components/iconify/Iconify";
import { LoadingButton } from "@mui/lab";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
} from "firebase/firestore";
import { db } from "../../firebase_config";

const formatDate = (date: any) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return date.toDate().toLocaleDateString("fr-FR", options);
};

const buttonStyle = {
  borderColor: "transparent",
  borderRadius: "15px",
  padding: "5px 10px",
  fontWeight: "bold",
  cursor: "pointer",
  width: "100%",
  color: "white", // Add this line to set the font color to white
};

const ODD_OPACITY = 0.2;
const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[200],
    "&:hover, &.Mui-hovered": {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
    "&.Mui-selected": {
      backgroundColor: alpha(
        theme.palette.primary.main,
        ODD_OPACITY + theme.palette.action.selectedOpacity
      ),
      "&:hover, &.Mui-hovered": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY +
            theme.palette.action.selectedOpacity +
            theme.palette.action.hoverOpacity
        ),
        // Reset on touch devices, it doesn't add specificity
        "@media (hover: none)": {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY + theme.palette.action.selectedOpacity
          ),
        },
      },
    },
  },
}));


export async function changeDefaultQuinzaine(id: number) {
  console.log("Changing default quinzaine: ", id);
  try {
    // Reference to your collection
    const collectionRef = collection(db, "Public");

    // Create a query to get all documents in the collection
    const q = query(collectionRef);

    // Get all documents matching the query
    const querySnapshot = await getDocs(q);

    // Run a transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      querySnapshot.forEach((document) => {
        const docData = document.data();
        const docRef = doc(db, "Public", document.id);

        if (docData.edition === Number(id)) {
          // Update the field
          transaction.update(docRef, {
            active: true,
          });
        } else {
          // Update the field
          transaction.update(docRef, {
            active: false,
          });
        }
      });
    });
    console.log("Default quinzaine changed successfully");
    return { success: true, message: id+"éme quinzaine mise par defaut avec succés" };
  } catch (error) {
    console.error("Error changing default quinzaine: ", error);
    return { success: false, message: "Merde, erreur: "+ error }; 
  }
}


interface QuinzaineTableProps {
  // Props type definition
  handleOpenModal: (data: any) => void;
}

export default function QuinzainesTable({
  handleOpenModal,
}: QuinzaineTableProps) {
  const { quinzaineData, refetchQuinzaineData } = useData();
  const [loadingDefault, setLoadingDefault] = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [error, setError] = useState("");
  const [errorSeverity, setErrorSeverity] = useState<AlertColor | undefined>(
    "error"
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (error) {
      timer = setTimeout(() => {
        setError("");
      }, 5000); // Set the timer to hide the error after 5 seconds
    }

    return () => {
      clearTimeout(timer);
    };
  }, [error]);

  async function setCurrent(id: number) {
    setLoadingCurrent(true);
    await refetchQuinzaineData(id);
    setLoadingCurrent(false);
    setErrorSeverity("success");
    setError(id + "éme quinzaine chargée avec succès!");
  }

  function extractObjectsFromQuinzaineData(): Array<{
    id: string;
    value: Record<string, any>;
  }> {
    const result: Array<{ id: string; value: Record<string, any> }> = [];

    const quinzaineMap = quinzaineData?.get("15n");
    if (quinzaineMap && quinzaineMap instanceof Map) {
      //console.log("Test pass");
      quinzaineMap.forEach((value, id) => {
        result.push({ id, ...value });
      });
    }

    return result;
  }

  //console.log("Qnzn test: ",extractObjectsFromQuinzaineData());

  async function handleChangeDefaultQuinzaine(id: number) {
    setLoadingDefault(true);
    setLoadingCurrent(true);
    setError("");
    setErrorSeverity("error");

    const { success, message } = await changeDefaultQuinzaine(id);

    if (success) {
      refetchQuinzaineData();
      setLoadingDefault(false);
      setLoadingCurrent(false);
      setErrorSeverity("success");
      setError(message);
    } else {
      setLoadingDefault(false);
      setLoadingCurrent(false);
      setError(message);
    }

  }

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      editable: false,
      minWidth: 110,
      renderCell: (params: GridCellParams) => (
        <LoadingButton
          style={{
            ...buttonStyle,
            backgroundColor: loadingCurrent
              ? undefined
              : params.row.id == quinzaineData?.get("currentEdition")
              ? "green"
              : "red",
          }}
          onClick={() => setCurrent(params.row.id as number)}
          loading={loadingCurrent}
        >
          {params.row.id}
          {params.row.id == quinzaineData?.get("active") ? " active" : ""}
        </LoadingButton>
      ),
    },
    {
      field: "default",
      headerName: "Par defaut",
      flex: 1,
      editable: false,
      minWidth: 140,
      renderCell: (params: GridCellParams) => (
        <LoadingButton
          style={{
            ...buttonStyle,
            backgroundColor: loadingDefault
              ? undefined
              : params.row.id == quinzaineData?.get("defaultEdition")
              ? "green"
              : "red",
          }}
          onClick={() => handleChangeDefaultQuinzaine(params.row.id as number)}
          loading={loadingDefault}
        >
          {params.row.id == quinzaineData?.get("defaultEdition") ? "Par defaut" : "Non par defaut"}
        </LoadingButton>
      ),
    },
    {
      field: "author",
      headerName: "Author",
      flex: 1,
      editable: false,
      minWidth: 100,
    },
    {
      field: "year",
      headerName: "Year",
      flex: 1,
      editable: false,
      minWidth: 100,
    },
    {
      field: "creation_date",
      headerName: "Creation Date",
      width: 150,
      editable: false,
      flex: 1,
      minWidth: 190,
      valueGetter: (value) => {
        if (!value) {
          return value;
        }
        return formatDate(value);
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Edit",
      minWidth: 100,
      cellClassName: "actions",
      getActions: (params: GridRowParams) => {
        const rowData = params.row;
        return [
          <GridActionsCellItem
            icon={<Iconify icon="ic:outline-edit" />}
            label="Edit"
            className="textPrimary"
            onClick={() => handleOpenModal(rowData)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <>
      <StripedDataGrid
        style={{ height: "500px", width: "100%" }}
        disableRowSelectionOnClick
        rows={extractObjectsFromQuinzaineData()}
        columns={columns}
        getRowId={(row) => row.id}
        autoPageSize
        pageSizeOptions={[5, 10, 25]}
        disableColumnMenu
        slots={{ toolbar: GridToolbar }}
        isCellEditable={(params) =>
          params.field === "autor" || params.field === "year"
        }
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
        }
      />
      {error && (
        <Alert
          sx={{ mt: 3 }}
          severity={errorSeverity}
          onClose={() => {
            setError("");
          }}
        >
          {error}
        </Alert>
      )}
    </>
  );
}
