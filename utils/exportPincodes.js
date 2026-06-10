export const handleExport = (pincodes) => {
    if(!pincodes.length) return;

    const header = 
    "pincode, city, State, DelivryDays,Active,Note";

    const rows = pincodes.map(
        (p) =>
      `${p.pincode},${p.city},${p.state},${p.deliveryDays},${p.isActive},${p.note}`
    );

    const bolb = new Blob(
        [[header, ...rows].join("\n")],
     {
        type: "text/csv",
     }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;

    a.download = `pincodes_${
        new Date().toISOString().split("T")[0]
    }.csv`;

    a.click();

    URL.revokeObjectURL(url);
};
