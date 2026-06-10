export const getPincodes = async () => {
    const res = await fetch("/api/pincodes", {
        cache: "no-store",
    });

    return res.json();
};

export const deletePincode = async (id) => {
    const res = await fetch(`/api/pincodes/${id}`, {
        method: "DELETE",
    });
    return res.json();
};

export const addPincodeapi = async (payload) => {
    const res = await fetch("/api/pincodes", {
        method: "POST",
        headers: {"COntent-Type": "application/json"},
        body: JSON.stringify(payload)
    });
    return res.json();
}

export const togglePincode = async (
    id,
    isActive

) => {
    const res = await fetch(`/api/pincodes/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify({
            isActive,
        }),
    });

    return res.json();
}
