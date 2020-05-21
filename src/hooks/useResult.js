import { useReducer, useEffect } from "react";

const reducer = (state, action) => {
  switch (action.type) {
    case "START_FETCHING":
      return {
        ...state,
        loading: true,
        error: null,
        status: null,
        data: null,
      };
    case "UPDATE_STATUS":
      return {
        ...state,
        loading: false,
        error: null,
        status: action.status,
        data: action.data,
      };
    case "NETWORK_ERROR":
      return {
        ...state,
        loading: false,
        error: action.error,
        status: null,
        data: null,
      };
  }
};

export default function useResult(id) {
  const [state, dispatch] = useReducer(reducer, {});
  const host = process.env.GRPC_ADDR || "https://annotation.mozi.ai/web";

  const fetchStatus = () =>
    fetch(`${host}/status/${id}`).then((res) => res.json());

  const fetchResult = () => fetch(`${host}/${id}`).then((res) => res.json());

  useEffect(() => {
    dispatch({ type: "START_FETCHING" });
    (async () => {
      try {
        const status = await fetchStatus();
        if (status.status === 2) {
          const res = await fetchResult();
          dispatch({ type: "UPDATE_STATUS", status, data: res });
        } else {
          dispatch({ type: "UPDATE_STATUS", status });
        }
      } catch (error) {
        dispatch({ type: "NETWORK_ERROR", error });
      }
    })();
  }, [id]);

  return [state.loading, state.status, state.data, state.error];
}
