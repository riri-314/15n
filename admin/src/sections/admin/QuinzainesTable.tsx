import { Button, alpha, styled } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridCellParams,
  gridClasses,
} from "@mui/x-data-grid";
import { useData } from "../../providers/DataProvider";
import Iconify from "../../components/iconify/Iconify";

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

export default function QuinzainesTable() {
  const { privateData } = useData();

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      editable: false,
      minWidth: 100,
      renderCell: (params: GridCellParams) => (
        <Button
          style={{
            ...buttonStyle,
            backgroundColor: params.row.id == privateData?.get("edition") ? "green" : "red",
          }}
          onClick={() => console.log(params.row.id)}
        >
          {params.row.id}
          {params.row.id == privateData?.get("edition") ? " active" : ""}
        </Button>
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
      field: "button",
      headerName: "Edit data",
      width: 100,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <Button
          style={{
            ...buttonStyle,
          }}
          variant="contained"
          onClick={() => console.log(params.row.id)}
        >
          <Iconify icon="material-symbols:edit-note-outline-rounded" />
        </Button>
      ),
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
    </>
  );
}
