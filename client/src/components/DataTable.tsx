/**
 * Таблица к условию задания (ВПР 6: таблицы, диаграммы).
 */

export interface DataTableColumn {
  key: string;
  title: string;
  width?: string;
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: Record<string, string | number>[];
  caption?: string;
  highlightRow?: number;
}

export function DataTable({
  columns,
  data,
  caption,
  highlightRow,
}: DataTableProps) {
  return (
    <div className="my-4 overflow-x-auto">
      {caption && (
        <p className="text-sm text-muted-foreground mb-2 text-center">
          {caption}
        </p>
      )}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="border border-border bg-muted/50 px-3 py-2 text-center font-semibold"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={
                highlightRow === index
                  ? "bg-primary/10"
                  : "hover:bg-muted/30"
              }
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="border border-border px-3 py-2 text-center"
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
