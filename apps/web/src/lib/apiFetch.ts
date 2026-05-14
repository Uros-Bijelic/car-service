export const apiFetch = async <T>(
    url: string,
    token?: string | null,
    options?: RequestInit
): Promise<T> => {
    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options?.headers
        }
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ message: 'Something went wrong!' }));
        throw new Error(error.message);
    }

    const data = await response.json();

    return data;
};
