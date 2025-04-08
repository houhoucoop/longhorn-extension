
// import {
//   LONGHORN_PAGES
// } from "../types/longhorn";
// import { _MERGE } from '@shell/plugins/dashboard-store/actions';

export const actions = {
  subscribe(ctx: any, pOpt: any) {
    const { state, rootState, rootGetters, dispatch, commit } = ctx
    const opt = pOpt.opt || pOpt;
    const { type, url } = opt

    // prevent duplicate ws connections for the same type
    if (state.sockets?.[type]?.readyState === WebSocket.OPEN || state.sockets?.[type]?.readyState === WebSocket.CONNECTING) {
      console.info(`WebSocket for ${type} already exists. Skipping new connection.`);
      return;
    }

    const ws = new WebSocket(url);

    // store the ws instance to prevent reconnects
    if (!state.sockets) {
      state.sockets = {};
    }
    state.sockets[type] = ws;

    ws.onopen = () => {
      console.info(`WebSocket connected for ${type} at ${url}`);
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.info(`Received message for ${type}:`, message);

      const formattedNodes = await dispatch(`formatNodes`, message);

      const inStore = rootGetters['currentProduct'].inStore;
      // await dispatch(`${inStore}/findAll`, { type, opt: { force: true, load: _MERGE }}, { root: true });
      commit(`${inStore}/loadMerge`, {
        ctx,
        type,
        data: formattedNodes.data,
        existing: true
      }, { root: true });
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${type}:`, error);
    };

    ws.onclose = (event) => {
      console.info(`WebSocket closed for ${type}:`, event);
    };
  },
};

export const getters = {

};
