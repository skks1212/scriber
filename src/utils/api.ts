export const API_BASE_URL = "/api/";

export type paginatedResponse<T> = {
    count: number;
    has_next: boolean;
    has_previous: boolean;
    offset: number;
    results: T[];
};

type methods = "POST" | "GET" | "PATCH" | "DELETE" | "PUT";

type options = {
    formdata?: boolean;
    external?: boolean;
    headers?: any;
    auth?: boolean;
};

const request = async (
    endpoint: string,
    method: methods = "GET",
    data: any = {},
    options: options = {}
) => {
    const { formdata, external, headers, auth: isAuth } = options;

    let url = external ? endpoint : (API_BASE_URL + endpoint);
    let payload: null | string = formdata ? data : JSON.stringify(data);

    if (method === "GET") {
        const requestParams = data
            ? `?${Object.keys(data)
                .filter((key) => data[key] !== null && data[key] !== undefined)
                .map((key) => `${key}=${data[key]}`)
                .join("&")}`
            : "";
        url += requestParams;
        payload = null;
    }

    let storage: Storage;
    let deviceInfo = {};

    if (typeof document !== "undefined") {
        storage = JSON.parse(
            document.cookie
                .split(";")
                .find((c) =>
                    c
                        .trim()
                        .startsWith(
                            (process.env.NEXT_PUBLIC_STORAGE_COOKIE || "storage") + "="
                        )
                )
                ?.replace((process.env.NEXT_PUBLIC_STORAGE_COOKIE || "storage") + "=", "") || "{}"
        );
        deviceInfo = {
            user_agent: navigator.userAgent
        }
    } else {
        const { cookies } = require("next/headers");
        const cookieStore = cookies();
        const cookie = cookieStore.get(
            process.env.NEXT_PUBLIC_STORAGE_COOKIE || "storage"
        );
        storage = JSON.parse(cookie?.value || "{}");
        deviceInfo = {
            user_agent: "next-server"
        }
    }
    const localToken = storage.auth_token;

    const auth =
        isAuth === false || typeof localToken === "undefined" || localToken === null
            ? undefined
            : "Token " + localToken;

    try {
        const response = await fetch(url, {
            method: method,
            headers: external ? { ...headers } : {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: auth,
                ...headers,
            },
            body: payload,
        });
        const txt = await response.clone().text();
        if (txt === "") {
            return {};
        }
        const json = await response.clone().json();
        if (json && response.ok) {
            return json;
        } else {
            throw json;
        }
    } catch (error) {
        throw typeof error === "object" ? error : { error };
    }
};

export const API = {
    user: {
        login: {
            getToken: (data: {
                client_url: string;
                redirect_url?: string;
            }) => request("auth/login", "GET", data),
            validateToken: (data: {
                login_token: string;
            }) => request("auth/login", "POST", data),
        },
        me: () => request("users/me"),
    },
};