
import {
  LONGHORN_PAGES,
} from "../types/longhorn";
import { _MERGE } from '@shell/plugins/dashboard-store/actions';

export const actions = {
  subscribe({ rootState, rootGetters, dispatch }: any, pOpt: any) {
    const opt = pOpt.opt || pOpt;
    const { type, url } = opt

    const ws = new WebSocket(url);
    ws.onopen = () => {
      console.info(`WebSocket connected for ${type} at ${url}`);
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.info(`Received message for ${type}:`, message);

      // TODO: do something here, e.g. overwrite the data in store or instance
      // commit('updateNodeData', message);
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
