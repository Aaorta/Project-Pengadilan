export const fetchInsert = async (payload: any, endpoint: string) => {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    return (await res.json()) as { success: boolean, message: string, status: number }
}

export const fetchDelete = async (key: string, endpoint: string) => {
    const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
    })
    return (await res.json()) as { success: boolean, message: string, status: number }
}

// put the key into the querystring
export const fetchUpdate = async (endpoint: string, key: string, payload: any) => {
    const res = await fetch(`${endpoint}?key=${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    return (await res.json()) as { success: boolean, message: string, status: number }
}