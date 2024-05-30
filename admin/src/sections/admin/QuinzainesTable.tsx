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

interface QuinzaineTableProps {
  // Props type definition
  handleOpenModal: (data: any) => void;
}

export default function QuinzainesTable({
  handleOpenModal,
}: QuinzaineTableProps) {
  const { privateData, refetchPrivateData } = useData();
  const [loading, setLoading] = useState(false);
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

  async function changeActiveQuinzaine(id: number) {
    setLoading(true);
    setError("");
    setErrorSeverity("error");

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

          // Check the condition based on another field's value
          console.log(
            "docData.edition",
            docData.edition,
            docData.edition === Number(id),
            Number(id)
          );
          console.log("typeof docData.edition", typeof docData.edition);
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

      console.log("Documents updated successfully!");
      refetchPrivateData();
      setLoading(false);
      setErrorSeverity("success");
      setError("Quinzaine " + id + " successfully set as active!");
    } catch (error) {
      setLoading(false);

      console.error("Error updating documents: ", error);
      setError("Error updating documents");
    }
  }

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      editable: false,
      minWidth: 100,
      renderCell: (params: GridCellParams) => (
        <LoadingButton
          style={{
            ...buttonStyle,
            backgroundColor: loading
              ? undefined
              : params.row.id == privateData?.get("edition")
              ? "green"
              : "red",
          }}
          onClick={() => changeActiveQuinzaine(params.row.id as number)}
          loading={loading}
        >
          {params.row.id}
          {params.row.id == privateData?.get("edition") ? " active" : ""}
        </LoadingButton>
      ),
    },
    {
      field: "autor",
      headerName: "Autor",
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
      minWidth: 100,
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
      headerName: "Éditer",
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
        rows={Array.from(privateData?.get("15n"), ([id, value]) => ({
          id,
          ...value,
        }))}
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
