export const getSettings = async () => {
    const res = await fetch("/api/settings");
    return await res.json();
};

export const saveSetting = async (key, value) => {
    const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
            "content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
    });

    const data = await res.json();
    if (!data.success) {
        throw new Error(data.message || "Failed to save setting");
    }
    return data;
};