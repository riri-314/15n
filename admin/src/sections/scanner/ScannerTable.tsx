import "./scanner.css";

interface scannerTableProps {
    TableData: any[];
    newRowId: string;
    handleArticleRemoval: (data: string) => void;
}

export default function ScannerTable({handleArticleRemoval, TableData, newRowId}:scannerTableProps) {
  console.log("TableData: ", TableData);
    return (
        <table className="styled-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Format</th>
            <th>Quantité</th>
            <th>Prix unitaire</th>
          </tr>
        </thead>
        <tbody>
          {TableData.map((row) => (
            <tr
              key={row.id}
              className={newRowId == row.id ? "glow-green" : ""}
              onDoubleClick={() => handleArticleRemoval(row.id)} //implement function
            >
              <td>{row.name}</td>
              <td>{row.format ? row.format + "cl" : ""}</td>
              <td>{row.quantity}</td>
              <td>{row.price_out + "€"}</td>
            </tr>
          ))}
        </tbody>
      </table>  
    );    
}