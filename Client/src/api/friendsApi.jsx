import axios from "./axios";
import auth from "../lib/auth";

// async function sendRequest({ email }) {
//     const res = await axios.post(
//         "/api/friend/send",
//         { email },
//         {
//             headers: {
//                 Authorization: `Bearer ${auth.token || ""}`,
//             },
//         }
//     );

//     return res.data; 
// }

async function sendRequest(email) {
    if (!email) {
        throw new Error("Email is required");
    }

    const { data } = await axios({
        method: "post",
        url: "/api/friend/send",
        data: { email },
        headers: {
            Authorization: auth.token ? `Bearer ${auth.token}` : "",
            "Content-Type": "application/json",
        },
    });

    return data;
}
async function acceptRequest(requestId) {
    const res = await axios.post(
        "/api/friend/accept",
        {requestId},
        {headers:{
            Authorization:`Bearer ${auth.token || ""}`
        }},
    );
    return res.data;
}

async function rejectRequest(requestId) {
    const res = await axios.post(
        "/api/friend/reject",
        {requestId},
        {
            headers:{
                Authorization:`Bearer ${auth.token || ""} `
            }
        },
    );
    return res.data;
}

async function getIncomming() {
    const res = await axios.get(
        "/api/friend/incoming",
        {headers:{
            Authorization:`Bearer ${auth.token || ""}`
        }},
    );
    return res.data;
}

async function getFriends() {
    const res = await axios.get(
        "/api/friend",
        {headers:{
            Authorization:`Bearer ${auth.token || ""}`
        }},
    );
    return res.data;
}

export const friendsApi = {
    sendRequest,
    acceptRequest,
    rejectRequest,
    getIncomming,
    getFriends
}