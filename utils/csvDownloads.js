export const CSV_pincodes = [
    { label: "PINCODE",       key: "pincode" },
    { label: "CITY",          key: "city" },
    { label: "STATE",         key: "state" },
    { label: "DELIVERY DAYS", key: "deliveryDays" },
    { label: "NOTE",          key: "note" },
];

export const toCSV = (rows) => {
    const escape = (value) => {
        const str = String(value ?? "");

        if (
            str.includes(",") ||
            str.includes('"') ||
            str.includes("\n")
        ) {
            return `"${str.replace(/"/g, '""')}"`;
        }

        return str;
    };

    return [
        CSV_pincodes.map((column) => column.label).join(","),
        ...rows.map((row) => 
            CSV_pincodes.map((column) => escape(row[column.key])).join(",")
        ),
    ].join("\n");
};

export const downloadCSV = (
    rows,
    filename = "pincodes.csv"
) => {
    const csv = toCSV(rows);

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

